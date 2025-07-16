import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// PUT /api/client-programs/[id] - Update program assignment (e.g., add completion date)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { completionDate, status, progressNotes } = body;

    const updateFields = [];
    const updateValues = [];

    if (completionDate !== undefined) {
      updateFields.push('completion_date = ?');
      updateValues.push(completionDate ? new Date(completionDate) : null);
    }

    if (status !== undefined) {
      updateFields.push('status = ?');
      updateValues.push(status);
    }

    if (progressNotes !== undefined) {
      updateFields.push('progress_notes = ?');
      updateValues.push(progressNotes);
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    updateValues.push(parseInt(params.id));

    await query(`
      UPDATE client_programs SET 
        ${updateFields.join(', ')},
        updated_at = NOW()
      WHERE id = ?
    `, updateValues);

    // Fetch the updated assignment
    const updatedAssignments = await query(`
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
      WHERE cp.id = ?
    `, [parseInt(params.id)]);

    return NextResponse.json(Array.isArray(updatedAssignments) ? updatedAssignments[0] : updatedAssignments);
  } catch (error) {
    console.error('Error updating program assignment:', error);
    return NextResponse.json(
      { error: 'Failed to update program assignment' },
      { status: 500 }
    );
  }
}

// DELETE /api/client-programs/[id] - Unassign program from client
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await query(`
      DELETE FROM client_programs WHERE id = ?
    `, [parseInt(params.id)]);
    
    return NextResponse.json({ message: 'Program assignment removed successfully' });
  } catch (error) {
    console.error('Error removing program assignment:', error);
    return NextResponse.json(
      { error: 'Failed to remove program assignment' },
      { status: 500 }
    );
  }
} 