import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET /api/client-programs - Get all client-program assignments
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const programId = searchParams.get('programId');

    let sql = `
      SELECT 
        cp.*,
        c.first_name as client_first_name,
        c.last_name as client_last_name,
        c.client_id as client_identifier,
        p.name as program_name,
        p.description as program_description
      FROM client_programs cp
      JOIN clients c ON cp.client_id = c.id
      JOIN programs p ON cp.program_id = p.id
    `;
    
    const params: any[] = [];
    
    if (clientId) {
      sql += ' WHERE cp.client_id = ?';
      params.push(parseInt(clientId));
    } else if (programId) {
      sql += ' WHERE cp.program_id = ?';
      params.push(parseInt(programId));
    }
    
    sql += ' ORDER BY cp.enrollment_date DESC';
    
    const assignments = await query(sql, params);
    
    return NextResponse.json(assignments);
  } catch (error) {
    console.error('Error fetching client-program assignments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch client-program assignments' },
      { status: 500 }
    );
  }
}

// POST /api/client-programs - Assign program to client(s)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clientIds, programId, enrollmentDate, status } = body;

    if (!clientIds || !Array.isArray(clientIds) || clientIds.length === 0) {
      return NextResponse.json(
        { error: 'Client IDs are required' },
        { status: 400 }
      );
    }

    if (!programId) {
      return NextResponse.json(
        { error: 'Program ID is required' },
        { status: 400 }
      );
    }

    const assignments = [];
    
    for (const clientId of clientIds) {
      // Check if assignment already exists
      const existing = await query(
        'SELECT id FROM client_programs WHERE client_id = ? AND program_id = ?',
        [clientId, programId]
      );
      
      if (Array.isArray(existing) && existing.length > 0) {
        continue; // Skip if already assigned
      }
      
      // Create new assignment
      const result = await query(`
        INSERT INTO client_programs (client_id, program_id, enrollment_date, status)
        VALUES (?, ?, ?, ?)
      `, [
        clientId,
        programId,
        enrollmentDate || new Date().toISOString().split('T')[0],
        status || 'enrolled'
      ]);
      
      assignments.push({
        clientId,
        programId,
        assignmentId: (result as any).insertId
      });
    }

    return NextResponse.json({
      message: `Successfully assigned program to ${assignments.length} client(s)`,
      assignments
    });
  } catch (error) {
    console.error('Error assigning program to clients:', error);
    return NextResponse.json(
      { error: 'Failed to assign program to clients' },
      { status: 500 }
    );
  }
} 