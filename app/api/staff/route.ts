import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcrypt';

// GET /api/staff - Fetch all staff
export async function GET() {
  try {
    console.log('Attempting to fetch staff from database...');
    const staff = await query(`
      SELECT 
        s.id,
        s.user_id,
        s.employee_id,
        s.first_name,
        s.last_name,
        s.title,
        s.specialization,
        s.phone,
        s.emergency_contact,
        s.hire_date,
        s.status,
        s.availability_status,
        s.max_clients,
        s.created_at,
        s.updated_at,
        u.username,
        u.email,
        u.role,
        u.is_active,
        u.last_login
      FROM staff s
      LEFT JOIN users u ON s.user_id = u.id
      ORDER BY s.created_at DESC
    `);
    
    console.log(`Successfully fetched ${Array.isArray(staff) ? staff.length : 0} staff members`);
    return NextResponse.json(staff);
  } catch (error) {
    console.error('Error fetching staff:', error);
    console.error('Error stack:', (error as Error)?.stack);
    console.error('Error message:', (error as Error)?.message);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch staff', 
        details: (error as Error)?.message || 'Unknown error',
        stack: (error as Error)?.stack 
      },
      { status: 500 }
    );
  }
}

// POST /api/staff - Create a new staff member
export async function POST(request: NextRequest) {
  try {
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
        body.firstName,
        body.lastName,
        role,
        true
      ]);
      
      userId = (userResult as any).insertId;
    }
    
    const result = await query(`
      INSERT INTO staff (
        user_id,
        employee_id,
        first_name,
        last_name,
        title,
        specialization,
        phone,
        emergency_contact,
        hire_date,
        status,
        availability_status,
        max_clients
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      userId,
      body.employeeId,
      body.firstName,
      body.lastName,
      body.title,
      body.specialization || null,
      body.phone || null,
      body.emergencyContact || null,
      body.hireDate ? new Date(body.hireDate) : new Date(),
      body.status || 'active',
      body.availabilityStatus || 'available',
      body.maxClients || 20,
    ]);
    
    // Fetch the created staff member with user info
    const createdStaff = await query(`
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
    `, [(result as any).insertId]);
    
    return NextResponse.json(Array.isArray(createdStaff) ? createdStaff[0] : createdStaff, { status: 201 });
  } catch (error) {
    console.error('Error creating staff:', error);
    return NextResponse.json(
      { error: 'Failed to create staff member' },
      { status: 500 }
    );
  }
} 