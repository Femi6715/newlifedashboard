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

// GET - Fetch replies for a specific note
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

    // Check if user can access this note
    let query = `
      SELECT 
        pb.id,
        pb.visibility
      FROM post_board pb
      WHERE pb.id = ? AND pb.status = 'active'
    `;

    const queryParams: any[] = [params.id];

    // If user is admin, they can see all notes
    if (userRole !== 'admin') {
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
      queryParams.push(user.id, userRole, user.id);
    }

    const [noteRows] = await connection.execute(query, queryParams);

    if ((noteRows as any[]).length === 0) {
      await connection.end();
      return NextResponse.json({ error: 'Note not found or access denied' }, { status: 404 });
    }

    // Get replies for this note
    const [replyRows] = await connection.execute(
      `SELECT 
        nr.id,
        nr.content,
        nr.created_at,
        nr.updated_at,
        CONCAT(u.first_name, ' ', u.last_name) as author_name,
        u.role as author_role,
        u.id as author_id
      FROM note_replies nr
      INNER JOIN users u ON nr.author_id = u.id
      WHERE nr.note_id = ?
      ORDER BY nr.created_at ASC`,
      [params.id]
    );

    await connection.end();

    return NextResponse.json({ replies: replyRows });
  } catch (error) {
    console.error('Error fetching replies:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a new reply
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { content } = body;

    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Reply content is required' }, { status: 400 });
    }

    const connection = await mysql.createConnection(dbConfig);

    // Check if user can access this note
    const [userRows] = await connection.execute(
      'SELECT role FROM users WHERE id = ?',
      [user.id]
    );
    const userRole = (userRows as any)[0]?.role;

    let query = `
      SELECT 
        pb.id,
        pb.visibility
      FROM post_board pb
      WHERE pb.id = ? AND pb.status = 'active'
    `;

    const queryParams: any[] = [params.id];

    if (userRole !== 'admin') {
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
      queryParams.push(user.id, userRole, user.id);
    }

    const [noteRows] = await connection.execute(query, queryParams);

    if ((noteRows as any[]).length === 0) {
      await connection.end();
      return NextResponse.json({ error: 'Note not found or access denied' }, { status: 404 });
    }

    // Check if reply limit is reached (5 replies max)
    const [replyCountRows] = await connection.execute(
      'SELECT COUNT(*) as count FROM note_replies WHERE note_id = ?',
      [params.id]
    );
    const replyCount = (replyCountRows as any[])[0]?.count || 0;

    if (replyCount >= 5) {
      await connection.end();
      return NextResponse.json({ error: 'Maximum of 5 replies allowed per note' }, { status: 400 });
    }

    // Insert the reply
    const [result] = await connection.execute(
      'INSERT INTO note_replies (note_id, author_id, content) VALUES (?, ?, ?)',
      [params.id, user.id, content.trim()]
    );

    await connection.end();

    // Log activity
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null;
    const userAgent = request.headers.get('user-agent') || null;
    await logActivity({
      user_id: user.id,
      action: 'reply',
      table_name: 'note_replies',
      record_id: (result as any).insertId,
      new_values: {
        note_id: params.id,
        author_id: user.id,
        content: content.trim()
      },
      ip_address: ip,
      user_agent: userAgent,
    });

    // Emit socket.io event for new reply
    try {
      // @ts-ignore: Next.js type issue
      const io = (global as any).io || (typeof res !== 'undefined' && res.socket && res.socket.server && res.socket.server.io);
      if (io) {
        io.emit('new_reply', { replyId: (result as any).insertId, note_id: params.id, author_id: user.id, content: content.trim() });
      }
    } catch (e) {
      // Ignore socket errors
    }

    return NextResponse.json({ 
      message: 'Reply created successfully',
      replyId: (result as any).insertId 
    });
  } catch (error) {
    console.error('Error creating reply:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 