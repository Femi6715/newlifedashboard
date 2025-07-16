import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcrypt';

// POST /api/users/[id]/reset-password - Reset user password
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = parseInt(params.id);
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    const body = await request.json();
    
    if (!body.newPassword) {
      return NextResponse.json({ error: 'New password is required' }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await query('SELECT id FROM users WHERE id = ?', [userId]);
    if (!Array.isArray(existingUser) || existingUser.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Hash the new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(body.newPassword, saltRounds);
    
    await query(`
      UPDATE users 
      SET password_hash = ?, updated_at = NOW()
      WHERE id = ?
    `, [hashedPassword, userId]);

    return NextResponse.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    );
  }
} 