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

// GET - Fetch available roles and users for visibility selection
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const connection = await mysql.createConnection(dbConfig);

    // Get all available roles
    const [roleRows] = await connection.execute(
      'SELECT DISTINCT role FROM users WHERE is_active = 1 ORDER BY role'
    );

    // Get all active users (for user-specific visibility)
    const [userRows] = await connection.execute(
      `SELECT 
        id,
        username,
        email,
        first_name,
        last_name,
        role,
        is_active
      FROM users 
      WHERE is_active = 1 
      ORDER BY first_name, last_name`
    );

    await connection.end();

    return NextResponse.json({
      roles: (roleRows as any[]).map(row => row.role),
      users: (userRows as any[]).map(row => ({
        id: row.id,
        username: row.username,
        email: row.email,
        name: `${row.first_name} ${row.last_name}`,
        role: row.role
      }))
    });
  } catch (error) {
    console.error('Error fetching visibility options:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 