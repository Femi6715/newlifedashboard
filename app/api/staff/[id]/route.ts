import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcrypt';

// GET /api/staff/[id] - Fetch a specific staff member
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const staff = await query(`
      SELECT 
        s.*,
        u.username,
        u.email,
        u.role,
        u.is_active,
        u.last_login
      FROM staff s
      LEFT JOIN users u ON s.user_id = u.id
      WHERE s.id = ?
    `, [parseInt(id)]);
    
    if (!Array.isArray(staff) || staff.length === 0) {
      return NextResponse.json(
        { error: 'Staff member not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(staff[0]);
  } catch (error) {
    console.error('Error fetching staff:', error);
    return NextResponse.json(
      { error: 'Failed to fetch staff member' },
      { status: 500 }
    );
  }
}

// PUT /api/staff/[id] - Update a staff member
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    let userId = body.userId || null;
    
    // If creating a new user account, create it first
    if (body.createUserAccount && body.userAccount) {
      const { username, email, password, role } = body.userAccount;
      
      // Check if username or email already exists
      const existingUser = await query(`
        SELECT id FROM users WHERE username = ? OR email = ?
      `, [username, email]);

      if (Array.isArray(existingUser) && existingUser.length > 0) {
        return NextResponse.json(
          { error: 'Username or email already exists' },
          { status: 409 }
        );
      }

      // Hash the password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      const userResult = await query(`
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
        username,
        email,
        hashedPassword,
        body.firstName || '',
        body.lastName || '',
        role,
        true
      ]);
      
      userId = (userResult as any).insertId;
    }
    
    // Build update query dynamically to handle undefined values
    const updateFields = [];
    const updateValues = [];

    if (body.employeeId !== undefined) {
      updateFields.push('employee_id = ?');
      updateValues.push(body.employeeId);
    }
    if (body.title !== undefined) {
      updateFields.push('title = ?');
      updateValues.push(body.title);
    }
    if (body.specialization !== undefined) {
      updateFields.push('specialization = ?');
      updateValues.push(body.specialization);
    }
    if (body.phone !== undefined) {
      updateFields.push('phone = ?');
      updateValues.push(body.phone);
    }
    if (body.emergencyContact !== undefined) {
      updateFields.push('emergency_contact = ?');
      updateValues.push(body.emergencyContact);
    }
    if (body.hireDate !== undefined) {
      updateFields.push('hire_date = ?');
      updateValues.push(body.hireDate ? new Date(body.hireDate) : null);
    }
    if (body.status !== undefined) {
      updateFields.push('status = ?');
      updateValues.push(body.status);
    }
    if (body.availabilityStatus !== undefined) {
      updateFields.push('availability_status = ?');
      updateValues.push(body.availabilityStatus);
    }
    if (body.maxClients !== undefined) {
      updateFields.push('max_clients = ?');
      updateValues.push(body.maxClients);
    }
    if (body.firstName !== undefined) {
      updateFields.push('first_name = ?');
      updateValues.push(body.firstName);
    }
    if (body.lastName !== undefined) {
      updateFields.push('last_name = ?');
      updateValues.push(body.lastName);
    }
    if (userId !== undefined) {
      updateFields.push('user_id = ?');
      updateValues.push(userId);
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    updateFields.push('updated_at = NOW()');
    updateValues.push(parseInt(id));

    await query(`
      UPDATE staff 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `, updateValues);
    
    // Fetch the updated staff member with user info
    const updatedStaff = await query(`
      SELECT 
        s.*,
        u.username,
        u.email,
        u.role,
        u.is_active,
        u.last_login
      FROM staff s
      LEFT JOIN users u ON s.user_id = u.id
      WHERE s.id = ?
    `, [parseInt(id)]);
    
    return NextResponse.json(Array.isArray(updatedStaff) ? updatedStaff[0] : updatedStaff);
  } catch (error) {
    console.error('Error updating staff:', error);
    return NextResponse.json(
      { error: 'Failed to update staff member' },
      { status: 500 }
    );
  }
}

// DELETE /api/staff/[id] - Delete a staff member
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Get the staff member to check if they have a user account
    const staff = await query(`
      SELECT user_id FROM staff WHERE id = ?
    `, [parseInt(id)]) as any[];
    
    if (Array.isArray(staff) && staff.length > 0 && staff[0].user_id) {
      // Optionally delete the user account as well
      // For now, we'll just unlink it
      await query(`
        UPDATE users SET is_active = false WHERE id = ?
      `, [staff[0].user_id]);
    }
    
    await query(`
      DELETE FROM staff WHERE id = ?
    `, [parseInt(id)]);
    
    return NextResponse.json({ message: 'Staff member deleted successfully' });
  } catch (error) {
    console.error('Error deleting staff:', error);
    return NextResponse.json(
      { error: 'Failed to delete staff member' },
      { status: 500 }
    );
  }
} 