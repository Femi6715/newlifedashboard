import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcrypt';
import { logActivity } from '@/lib/db-pool';

// GET /api/users - Fetch all users
export async function GET() {
  try {
    console.log('Attempting to fetch users from database...');
    const users = await query(`
      SELECT 
        id,
        username,
        email,
        first_name,
        last_name,
        role,
        is_active,
        last_login,
        created_at,
        updated_at
      FROM users 
      ORDER BY created_at DESC
    `);
    
    console.log(`Successfully fetched ${Array.isArray(users) ? users.length : 0} users`);
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST /api/users - Create a new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.username || !body.email || !body.password || !body.firstName || !body.lastName || !body.role) {
      return NextResponse.json(
        { error: 'Missing required fields: username, email, password, firstName, lastName, role' },
        { status: 400 }
      );
    }

    // Check if username or email already exists
    const existingUser = await query(`
      SELECT id FROM users WHERE username = ? OR email = ?
    `, [body.username, body.email]);

    if (Array.isArray(existingUser) && existingUser.length > 0) {
      return NextResponse.json(
        { error: 'Username or email already exists' },
        { status: 409 }
      );
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(body.password, saltRounds);
    
    const result = await query(`
      INSERT INTO users (
        username,
        email,
        password_hash,
        first_name,
        last_name,
        role,
        is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      body.username,
      body.email,
      hashedPassword,
      body.firstName,
      body.lastName,
      body.role,
      body.isActive !== undefined ? body.isActive : true,
    ]);
    
    // Fetch the created user (without password)
    const createdUser = await query(`
      SELECT 
        id,
        username,
        email,
        first_name,
        last_name,
        role,
        is_active,
        last_login,
        created_at,
        updated_at
      FROM users WHERE id = ?
    `, [(result as any).insertId]);

    // Log activity
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null;
    const userAgent = request.headers.get('user-agent') || null;
    // Try to get the admin/creator user id from headers (if available)
    let creatorId = null;
    try {
      const userIdHeader = request.headers.get('x-user-id');
      if (userIdHeader) creatorId = parseInt(userIdHeader);
    } catch {}
    await logActivity({
      user_id: creatorId,
      action: 'create',
      table_name: 'users',
      record_id: (result as any).insertId,
      new_values: Array.isArray(createdUser) ? createdUser[0] : createdUser,
      ip_address: ip,
      user_agent: userAgent,
    });
    
    return NextResponse.json(Array.isArray(createdUser) ? createdUser[0] : createdUser, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
} 