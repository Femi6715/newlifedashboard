import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET /api/programs - Fetch all programs
export async function GET() {
  try {
    console.log('Attempting to fetch programs from database...');
    const programs = await query(`
      SELECT 
        id,
        name,
        description,
        duration,
        capacity,
        success_rate,
        status,
        program_type,
        cost_per_day,
        created_at,
        updated_at
      FROM programs 
      ORDER BY created_at DESC
    `);
    
    console.log(`Successfully fetched ${Array.isArray(programs) ? programs.length : 0} programs`);
    return NextResponse.json(programs);
  } catch (error) {
    console.error('Error fetching programs:', error);
    console.error('Error stack:', (error as Error)?.stack);
    console.error('Error message:', (error as Error)?.message);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch programs', 
        details: (error as Error)?.message || 'Unknown error',
        stack: (error as Error)?.stack 
      },
      { status: 500 }
    );
  }
}

// POST /api/programs - Create a new program
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const result = await query(`
      INSERT INTO programs (
        name,
        description,
        duration,
        capacity,
        success_rate,
        status,
        program_type,
        cost_per_day
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      body.name,
      body.description || null,
      body.duration || null,
      body.capacity || 10,
      body.successRate || null,
      body.status || 'active',
      body.programType || 'residential',
      body.costPerDay || null,
    ]);
    
    // Fetch the created program
    const createdProgram = await query(`
      SELECT * FROM programs WHERE id = ?
    `, [(result as any).insertId]);
    
    return NextResponse.json(Array.isArray(createdProgram) ? createdProgram[0] : createdProgram, { status: 201 });
  } catch (error) {
    console.error('Error creating program:', error);
    return NextResponse.json(
      { error: 'Failed to create program' },
      { status: 500 }
    );
  }
} 