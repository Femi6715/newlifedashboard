import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcrypt';
import { logActivity } from '@/lib/db-pool';

// GET /api/users/[id] - Fetch a specific user
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = parseInt(params.id);
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

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
      WHERE id = ?
    `, [userId]);

    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(users[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// PUT /api/users/[id] - Update a user
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = parseInt(params.id);
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    const body = await request.json();
    
    // Check if user exists
    const existingUser = await query('SELECT id FROM users WHERE id = ?', [userId]);
    if (!Array.isArray(existingUser) || existingUser.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if username or email already exists (excluding current user)
    if (body.username || body.email) {
      const duplicateCheck = await query(`
        SELECT id FROM users WHERE (username = ? OR email = ?) AND id != ?
      `, [body.username || '', body.email || '', userId]);

      if (Array.isArray(duplicateCheck) && duplicateCheck.length > 0) {
        return NextResponse.json(
          { error: 'Username or email already exists' },
          { status: 409 }
        );
      }
    }

    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];

    if (body.username !== undefined) {
      updateFields.push('username = ?');
      updateValues.push(body.username);
    }
    if (body.email !== undefined) {
      updateFields.push('email = ?');
      updateValues.push(body.email);
    }
    if (body.firstName !== undefined) {
      updateFields.push('first_name = ?');
      updateValues.push(body.firstName);
    }
    if (body.lastName !== undefined) {
      updateFields.push('last_name = ?');
      updateValues.push(body.lastName);
    }
    if (body.role !== undefined) {
      updateFields.push('role = ?');
      updateValues.push(body.role);
    }
    if (body.isActive !== undefined) {
      updateFields.push('is_active = ?');
      updateValues.push(body.isActive);
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    updateFields.push('updated_at = NOW()');
    updateValues.push(userId);

    await query(`
      UPDATE users 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `, updateValues);

    // Fetch the updated user
    const updatedUser = await query(`
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
    `, [userId]);

    // Log activity
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null;
    const userAgent = request.headers.get('user-agent') || null;
    let updaterId = null;
    try {
      const userIdHeader = request.headers.get('x-user-id');
      if (userIdHeader) updaterId = parseInt(userIdHeader);
    } catch {}
    await logActivity({
      user_id: updaterId,
      action: 'update',
      table_name: 'users',
      record_id: userId,
      old_values: existingUser[0],
      new_values: body,
      ip_address: ip,
      user_agent: userAgent,
    });

    return NextResponse.json(Array.isArray(updatedUser) ? updatedUser[0] : updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// PATCH /api/users/[id]/reset-password - Reset user password
export async function PATCH(
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

// DELETE /api/users/[id] - Delete a user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = parseInt(params.id);
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await query('SELECT id FROM users WHERE id = ?', [userId]);
    if (!Array.isArray(existingUser) || existingUser.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user is linked to any staff
    const linkedStaff = await query('SELECT id FROM staff WHERE user_id = ?', [userId]);
    if (Array.isArray(linkedStaff) && linkedStaff.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete user: linked to staff member. Please unlink from staff first.' },
        { status: 409 }
      );
    }

    await query('DELETE FROM users WHERE id = ?', [userId]);

    // Log activity
    const ipDel = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null;
    const userAgentDel = request.headers.get('user-agent') || null;
    let deleterId = null;
    try {
      const userIdHeader = request.headers.get('x-user-id');
      if (userIdHeader) deleterId = parseInt(userIdHeader);
    } catch {}
    await logActivity({
      user_id: deleterId,
      action: 'delete',
      table_name: 'users',
      record_id: userId,
      old_values: existingUser[0],
      ip_address: ipDel,
      user_agent: userAgentDel,
    });

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
} 