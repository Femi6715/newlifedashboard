import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { logActivity } from '@/lib/db-pool';

// Database connection configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '62221085',
  database: 'newlife_recovery_db',
};

// Helper function to get user from request headers
const getUserFromRequest = (request: NextRequest) => {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  try {
    const token = authHeader.substring(7);
    const user = JSON.parse(Buffer.from(token, 'base64').toString());
    return user;
  } catch (error) {
    return null;
  }
};

// GET - Fetch posts based on user permissions
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const connection = await mysql.createConnection(dbConfig);
    
    // Get user's role
    const [userRows] = await connection.execute(
      'SELECT role FROM users WHERE id = ?',
      [user.id]
    );
    const userRole = (userRows as any)[0]?.role;

    // Build query to get posts user can see
    let query = `
      SELECT DISTINCT 
        pb.id,
        pb.title,
        pb.content,
        pb.author_id,
        pb.visibility,
        pb.status,
        pb.created_at,
        pb.updated_at,
        CONCAT(u.first_name, ' ', u.last_name) as author_name,
        u.role as author_role
      FROM post_board pb
      INNER JOIN users u ON pb.author_id = u.id
      WHERE pb.status = 'active'
    `;

    const params: any[] = [];

    // If user is admin, show all posts
    if (userRole === 'admin') {
      query += '';
    } else {
      // For non-admin users, apply visibility restrictions
      query += `
        AND (
          pb.visibility = 'public'
          OR pb.author_id = ?
          OR (pb.visibility = 'role_based' AND EXISTS (
            SELECT 1 FROM post_board_roles pbr 
            WHERE pbr.post_id = pb.id AND pbr.role = ?
          ))
          OR (pb.visibility = 'user_specific' AND EXISTS (
            SELECT 1 FROM post_board_users pbu 
            WHERE pbu.post_id = pb.id AND pbu.user_id = ?
          ))
        )
      `;
      params.push(user.id, userRole, user.id);
    }

    query += ' ORDER BY pb.created_at DESC';

    const [rows] = await connection.execute(query, params);
    
    // Get visibility details for each post
    const postsWithVisibility = await Promise.all((rows as any[]).map(async (post) => {
      let visibilityDetails: {
        roles: string[];
        users: Array<{ id: number; name: string; role: string }>;
      } = {
        roles: [],
        users: []
      };

      if (post.visibility === 'role_based') {
        const [roleRows] = await connection.execute(
          'SELECT role FROM post_board_roles WHERE post_id = ?',
          [post.id]
        );
        visibilityDetails.roles = (roleRows as any[]).map(row => row.role);
      }

      if (post.visibility === 'user_specific') {
        const [userRows] = await connection.execute(
          `SELECT u.id, CONCAT(u.first_name, ' ', u.last_name) as name, u.role 
           FROM post_board_users pbu 
           INNER JOIN users u ON pbu.user_id = u.id 
           WHERE pbu.post_id = ?`,
          [post.id]
        );
        visibilityDetails.users = (userRows as any[]).map(row => ({
          id: row.id,
          name: row.name,
          role: row.role
        }));
      }

      return {
        ...post,
        visibilityDetails
      };
    }));

    await connection.end();

    return NextResponse.json({ posts: postsWithVisibility });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a new post
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, content, visibility, selectedRoles, selectedUsers } = body;

    if (!title || !content || !visibility) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const connection = await mysql.createConnection(dbConfig);

    // Start transaction
    await connection.beginTransaction();

    try {
      // Insert the main post
      const [result] = await connection.execute(
        'INSERT INTO post_board (title, content, author_id, visibility, status) VALUES (?, ?, ?, ?, ?)',
        [title, content, user.id, visibility, 'active']
      );

      const postId = (result as any).insertId;

      // Insert role-based visibility if applicable
      if (visibility === 'role_based' && selectedRoles && selectedRoles.length > 0) {
        for (const role of selectedRoles) {
          await connection.execute(
            'INSERT INTO post_board_roles (post_id, role) VALUES (?, ?)',
            [postId, role]
          );
        }
      }

      // Insert user-specific visibility if applicable
      if (visibility === 'user_specific' && selectedUsers && selectedUsers.length > 0) {
        for (const userId of selectedUsers) {
          await connection.execute(
            'INSERT INTO post_board_users (post_id, user_id) VALUES (?, ?)',
            [postId, userId]
          );
        }
      }

      await connection.commit();
      await connection.end();

      // Log activity
      const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null;
      const userAgent = request.headers.get('user-agent') || null;
      await logActivity({
        user_id: user.id,
        action: 'create',
        table_name: 'post_board',
        record_id: postId,
        new_values: {
          title, content, visibility, selectedRoles, selectedUsers
        },
        ip_address: ip, user_agent: userAgent
      });

      // Emit socket.io event for new note
      try {
        // @ts-ignore: Next.js type issue
        const io = (global as any).io || (typeof res !== 'undefined' && res.socket && res.socket.server && res.socket.server.io);
        if (io) {
          io.emit('new_note', { postId, title, content, author_id: user.id, visibility });
        }
      } catch (e) {
        // Ignore socket errors
      }

      return NextResponse.json({ success: true, postId });
    } catch (err) {
      await connection.rollback();
      await connection.end();
      return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 