import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

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

// GET - Optimized fetch of posts with replies and visibility details
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

    // Build optimized query to get posts user can see
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
    const posts = rows as any[];

    if (posts.length === 0) {
      await connection.end();
      return NextResponse.json({ posts: [] });
    }

    // Get all post IDs
    const postIds = posts.map(post => post.id);

    // Fetch all visibility details in one query
    const [visibilityRows] = await connection.execute(
      `SELECT 
        pbr.post_id,
        pbr.role,
        'role' as type
      FROM post_board_roles pbr 
      WHERE pbr.post_id IN (${postIds.map(() => '?').join(',')})
      UNION ALL
      SELECT 
        pbu.post_id,
        CONCAT(u.first_name, ' ', u.last_name) as role,
        'user' as type
      FROM post_board_users pbu 
      INNER JOIN users u ON pbu.user_id = u.id
      WHERE pbu.post_id IN (${postIds.map(() => '?').join(',')})`,
      [...postIds, ...postIds]
    );

    // Fetch all replies in one query
    const [replyRows] = await connection.execute(
      `SELECT 
        nr.note_id as post_id,
        nr.id,
        nr.content,
        nr.created_at,
        nr.updated_at,
        CONCAT(u.first_name, ' ', u.last_name) as author_name,
        u.role as author_role,
        u.id as author_id
      FROM note_replies nr
      INNER JOIN users u ON nr.author_id = u.id
      WHERE nr.note_id IN (${postIds.map(() => '?').join(',')})
      ORDER BY nr.note_id, nr.created_at ASC`,
      postIds
    );

    await connection.end();

    // Process visibility data
    const visibilityMap = new Map();
    (visibilityRows as any[]).forEach(row => {
      if (!visibilityMap.has(row.post_id)) {
        visibilityMap.set(row.post_id, { roles: [], users: [] });
      }
      if (row.type === 'role') {
        visibilityMap.get(row.post_id).roles.push(row.role);
      } else {
        visibilityMap.get(row.post_id).users.push({
          name: row.role,
          role: row.role // This would need to be enhanced to get actual role
        });
      }
    });

    // Process replies data
    const repliesMap = new Map();
    (replyRows as any[]).forEach(row => {
      if (!repliesMap.has(row.post_id)) {
        repliesMap.set(row.post_id, []);
      }
      repliesMap.get(row.post_id).push({
        id: row.id,
        content: row.content,
        created_at: row.created_at,
        updated_at: row.updated_at,
        author_name: row.author_name,
        author_role: row.author_role,
        author_id: row.author_id
      });
    });

    // Combine all data
    const postsWithData = posts.map(post => ({
      ...post,
      visibilityDetails: visibilityMap.get(post.id) || { roles: [], users: [] },
      replies: repliesMap.get(post.id) || []
    }));

    return NextResponse.json({ posts: postsWithData });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 