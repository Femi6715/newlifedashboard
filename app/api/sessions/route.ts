import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET /api/sessions - Fetch all sessions
export async function GET() {
  try {
    console.log('Attempting to fetch sessions from database...');
    const sessions = await query(`
      SELECT 
        id,
        session_type,
        title,
        description,
        scheduled_date,
        scheduled_time,
        duration_minutes,
        status,
        room_location,
        max_participants,
        notes,
        created_at,
        updated_at
      FROM sessions 
      ORDER BY scheduled_date ASC, scheduled_time ASC
    `);
    
    console.log(`Successfully fetched ${Array.isArray(sessions) ? sessions.length : 0} sessions`);
    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    console.error('Error stack:', (error as Error)?.stack);
    console.error('Error message:', (error as Error)?.message);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch sessions', 
        details: (error as Error)?.message || 'Unknown error',
        stack: (error as Error)?.stack 
      },
      { status: 500 }
    );
  }
}

// POST /api/sessions - Create a new session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const result = await query(`
      INSERT INTO sessions (
        session_type,
        title,
        description,
        scheduled_date,
        scheduled_time,
        duration_minutes,
        status,
        room_location,
        max_participants,
        notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      body.sessionType,
      body.title || null,
      body.description || null,
      body.scheduledDate ? new Date(body.scheduledDate) : new Date(),
      body.scheduledTime || '09:00:00',
      body.durationMinutes || 60,
      body.status || 'scheduled',
      body.roomLocation || null,
      body.maxParticipants || 1,
      body.notes || null,
    ]);
    
    // Fetch the created session
    const createdSession = await query(`
      SELECT * FROM sessions WHERE id = ?
    `, [(result as any).insertId]);
    
    return NextResponse.json(Array.isArray(createdSession) ? createdSession[0] : createdSession, { status: 201 });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
} 