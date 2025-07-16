import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { logActivity } from '@/lib/db-pool';

// GET /api/sessions/[id] - Fetch a specific session
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessions = await query(`
      SELECT * FROM sessions WHERE id = ?
    `, [parseInt(params.id)]);
    
    if (!Array.isArray(sessions) || sessions.length === 0) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(sessions[0]);
  } catch (error) {
    console.error('Error fetching session:', error);
    return NextResponse.json(
      { error: 'Failed to fetch session' },
      { status: 500 }
    );
  }
}

// PUT /api/sessions/[id] - Update a session
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    await query(`
      UPDATE sessions SET 
        session_type = ?,
        title = ?,
        description = ?,
        scheduled_date = ?,
        scheduled_time = ?,
        duration_minutes = ?,
        status = ?,
        room_location = ?,
        max_participants = ?,
        notes = ?
      WHERE id = ?
    `, [
      body.sessionType,
      body.title || null,
      body.description || null,
      body.scheduledDate ? new Date(body.scheduledDate) : null,
      body.scheduledTime || null,
      body.durationMinutes || 60,
      body.status,
      body.roomLocation || null,
      body.maxParticipants || 1,
      body.notes || null,
      parseInt(params.id)
    ]);
    
    // Fetch the updated session
    const updatedSessions = await query(`
      SELECT * FROM sessions WHERE id = ?
    `, [parseInt(params.id)]);
    
    return NextResponse.json(Array.isArray(updatedSessions) ? updatedSessions[0] : updatedSessions);
  } catch (error) {
    console.error('Error updating session:', error);
    return NextResponse.json(
      { error: 'Failed to update session' },
      { status: 500 }
    );
  }
}

// DELETE /api/sessions/[id] - Delete a session
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get session details before deletion
    const sessions = await query(`
      SELECT * FROM sessions WHERE id = ?
    `, [parseInt(params.id)]);
    
    if (!Array.isArray(sessions) || sessions.length === 0) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }
    
    const session = sessions[0];
    
    await query(`
      DELETE FROM sessions WHERE id = ?
    `, [parseInt(params.id)]);
    
    // Log activity
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null;
    const userAgent = request.headers.get('user-agent') || null;
    let userId = null;
    try {
      const userIdHeader = request.headers.get('x-user-id');
      if (userIdHeader) userId = parseInt(userIdHeader);
    } catch {}
    await logActivity({
      user_id: userId,
      action: 'delete',
      table_name: 'sessions',
      record_id: parseInt(params.id),
      old_values: session,
      ip_address: ip,
      user_agent: userAgent,
    });
    
    return NextResponse.json({ message: 'Session deleted successfully' });
  } catch (error) {
    console.error('Error deleting session:', error);
    return NextResponse.json(
      { error: 'Failed to delete session' },
      { status: 500 }
    );
  }
} 