import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcrypt';
import { logActivity } from '@/lib/db-pool';

export async function POST(req: NextRequest) {
  try {
    const { identifier, password } = await req.json();
    if (!identifier || !password) {
      return NextResponse.json({ error: 'Username/email and password are required.' }, { status: 400 });
    }

    // Find user by username or email
    const users = await query(
      'SELECT * FROM users WHERE username = ? OR email = ? LIMIT 1',
      [identifier, identifier]
    ) as any[];
    if (!users || users.length === 0) {
      console.log('No user found for identifier:', identifier);
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }
    const user = users[0];
    console.log('User found:', user);
    console.log('User is_active value:', user.is_active, 'Type:', typeof user.is_active);

    // Compare password
    const match = await bcrypt.compare(password, user.password_hash);
    console.log('Password match:', match);
    if (!match) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    // Check if account is active
    if (!user.is_active) {
      return NextResponse.json({ error: 'Your account is disabled. Please contact an administrator or clinical director.' }, { status: 403 });
    }

    // Ensure is_active is a boolean and defaults to true if null/undefined
    const isActive = user.is_active === null || user.is_active === undefined ? true : Boolean(user.is_active);
    console.log('Processed is_active value:', isActive);

    // Remove sensitive info and return only required fields
    const userResponse = {
      id: user.id,
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      is_active: isActive,
      last_login: user.last_login,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };

    // Update last_login timestamp
    await query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

    // Log activity
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || null;
    const userAgent = req.headers.get('user-agent') || null;
    await logActivity({
      user_id: user.id,
      action: 'login',
      table_name: 'users',
      record_id: user.id,
      ip_address: ip,
      user_agent: userAgent,
    });

    console.log('Returning user data:', userResponse);

    return NextResponse.json({
      user: userResponse
    });
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
} 