import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET /api/programs/[id] - Fetch a specific program
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const programs = await query(`
      SELECT * FROM programs WHERE id = ?
    `, [parseInt(params.id)]);
    
    if (!Array.isArray(programs) || programs.length === 0) {
      return NextResponse.json(
        { error: 'Program not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(programs[0]);
  } catch (error) {
    console.error('Error fetching program:', error);
    return NextResponse.json(
      { error: 'Failed to fetch program' },
      { status: 500 }
    );
  }
}

// PUT /api/programs/[id] - Update a program
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    await query(`
      UPDATE programs SET 
        name = ?,
        description = ?,
        duration = ?,
        capacity = ?,
        success_rate = ?,
        status = ?,
        program_type = ?,
        cost_per_day = ?
      WHERE id = ?
    `, [
      body.name,
      body.description || null,
      body.duration || null,
      body.capacity || 10,
      body.successRate || null,
      body.status,
      body.programType || 'residential',
      body.costPerDay || null,
      parseInt(params.id)
    ]);
    
    // Fetch the updated program
    const updatedPrograms = await query(`
      SELECT * FROM programs WHERE id = ?
    `, [parseInt(params.id)]);
    
    return NextResponse.json(Array.isArray(updatedPrograms) ? updatedPrograms[0] : updatedPrograms);
  } catch (error) {
    console.error('Error updating program:', error);
    return NextResponse.json(
      { error: 'Failed to update program' },
      { status: 500 }
    );
  }
}

// DELETE /api/programs/[id] - Delete a program
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await query(`
      DELETE FROM programs WHERE id = ?
    `, [parseInt(params.id)]);
    
    return NextResponse.json({ message: 'Program deleted successfully' });
  } catch (error) {
    console.error('Error deleting program:', error);
    return NextResponse.json(
      { error: 'Failed to delete program' },
      { status: 500 }
    );
  }
} 