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

// GET - Fetch a specific post
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check if user can access this post
    let query = `
      SELECT 
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
      WHERE pb.id = ? AND pb.status = 'active'
      AND (
        pb.visibility = 'public'
        OR pb.author_id = ?
        OR u.role = 'admin'
    `;

    const queryParams: any[] = [params.id, user.id];

    // Add role-based visibility check (admin can see all posts)
    if (userRole !== 'admin') {
      query += `
        OR (pb.visibility = 'role_based' AND EXISTS (
          SELECT 1 FROM post_board_roles pbr 
          WHERE pbr.post_id = pb.id AND pbr.role = ?
        ))
      `;
      queryParams.push(userRole);
    }

    // Add user-specific visibility check (admin can see all posts)
    if (userRole !== 'admin') {
      query += `
        OR (pb.visibility = 'user_specific' AND EXISTS (
          SELECT 1 FROM post_board_users pbu 
          WHERE pbu.post_id = pb.id AND pbu.user_id = ?
        ))
      `;
      queryParams.push(user.id);
    }

    query += ')';

    const [postRows] = await connection.execute(query, queryParams);

    await connection.end();

    if ((postRows as any[]).length === 0) {
      return NextResponse.json({ error: 'Post not found or access denied' }, { status: 404 });
    }

    return NextResponse.json({ post: (postRows as any[])[0] });
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update a post (only author and admin can edit)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check if user can edit this post
    const [postRows] = await connection.execute(
      'SELECT author_id FROM post_board WHERE id = ?',
      [params.id]
    );

    if ((postRows as any[]).length === 0) {
      await connection.end();
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const post = (postRows as any[])[0];
    
    // Check if user is admin or the author
    const [userRows] = await connection.execute(
      'SELECT role FROM users WHERE id = ?',
      [user.id]
    );
    const userRole = (userRows as any)[0]?.role;

    if (userRole !== 'admin' && post.author_id !== user.id) {
      await connection.end();
      return NextResponse.json({ error: 'Forbidden - Only author or admin can edit' }, { status: 403 });
    }

    // Start transaction
    await connection.beginTransaction();

    try {
      // Update the main post
      await connection.execute(
        'UPDATE post_board SET title = ?, content = ?, visibility = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [title, content, visibility, params.id]
      );

      // Clear existing role and user permissions
      await connection.execute('DELETE FROM post_board_roles WHERE post_id = ?', [params.id]);
      await connection.execute('DELETE FROM post_board_users WHERE post_id = ?', [params.id]);

      // Insert new role-based visibility if applicable
      if (visibility === 'role_based' && selectedRoles && selectedRoles.length > 0) {
        for (const role of selectedRoles) {
          await connection.execute(
            'INSERT INTO post_board_roles (post_id, role) VALUES (?, ?)',
            [params.id, role]
          );
        }
      }

      // Insert new user-specific visibility if applicable
      if (visibility === 'user_specific' && selectedUsers && selectedUsers.length > 0) {
        for (const userId of selectedUsers) {
          await connection.execute(
            'INSERT INTO post_board_users (post_id, user_id) VALUES (?, ?)',
            [params.id, userId]
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
        action: 'update',
        table_name: 'post_board',
        record_id: parseInt(params.id),
        old_values: post,
        new_values: { title, content, visibility, selectedRoles, selectedUsers },
        ip_address: ip,
        user_agent: userAgent,
      });

      return NextResponse.json({ message: 'Post updated successfully' });
    } catch (error) {
      await connection.rollback();
      await connection.end();
      throw error;
    }
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete a post (only author and admin can delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const connection = await mysql.createConnection(dbConfig);

    // Check if user can delete this post
    const [postRows] = await connection.execute(
      'SELECT author_id FROM post_board WHERE id = ?',
      [params.id]
    );

    if ((postRows as any[]).length === 0) {
      await connection.end();
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const post = (postRows as any[])[0];
    
    // Check if user is admin or the author
    const [userRows] = await connection.execute(
      'SELECT role FROM users WHERE id = ?',
      [user.id]
    );
    const userRole = (userRows as any)[0]?.role;

    if (userRole !== 'admin' && post.author_id !== user.id) {
      await connection.end();
      return NextResponse.json({ error: 'Forbidden - Only author or admin can delete' }, { status: 403 });
    }

    // Soft delete by setting status to 'deleted'
    await connection.execute(
      'UPDATE post_board SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      ['deleted', params.id]
    );

    await connection.end();

    // Log activity
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null;
    const userAgent = request.headers.get('user-agent') || null;
    await logActivity({
      user_id: user.id,
      action: 'delete',
      table_name: 'post_board',
      record_id: parseInt(params.id),
      old_values: post,
      ip_address: ip,
      user_agent: userAgent,
    });

    return NextResponse.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 