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

// GET - Fetch all replies for posts user can access
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

    // Build query to get replies for posts user can see
    let query = `
      SELECT DISTINCT 
        nr.id,
        nr.note_id,
        nr.content,
        nr.created_at,
        nr.updated_at,
        CONCAT(u.first_name, ' ', u.last_name) as author_name,
        u.role as author_role,
        u.id as author_id
      FROM note_replies nr
      INNER JOIN users u ON nr.author_id = u.id
      INNER JOIN post_board pb ON nr.note_id = pb.id
      WHERE pb.status = 'active'
    `;

    const params: any[] = [];

    // If user is admin, show all replies
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

    query += ' ORDER BY nr.created_at DESC';

    const [rows] = await connection.execute(query, params);
    
    await connection.end();

    return NextResponse.json({ replies: rows });
  } catch (error) {
    console.error('Error fetching replies:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 