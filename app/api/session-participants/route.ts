import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { logActivity } from '@/lib/db-pool';

// GET /api/session-participants - Get session participants
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const clientId = searchParams.get('clientId');

    let sql = `
      SELECT 
        sp.*,
        c.first_name as client_first_name,
        c.last_name as client_last_name,
        c.client_id as client_identifier,
        s.title as staff_first_name,
        '' as staff_last_name,
        s.employee_id as staff_employee_id,
        sess.title as session_title,
        sess.session_type as session_type
      FROM session_participants sp
      LEFT JOIN clients c ON sp.client_id = c.id
      LEFT JOIN staff s ON sp.staff_id = s.id
      JOIN sessions sess ON sp.session_id = sess.id
    `;
    
    const params: any[] = [];
    
    if (sessionId) {
      sql += ' WHERE sp.session_id = ?';
      params.push(parseInt(sessionId));
    } else if (clientId) {
      sql += ' WHERE sp.client_id = ?';
      params.push(parseInt(clientId));
    }
    
    sql += ' ORDER BY sp.created_at DESC';
    
    const participants = await query(sql, params);
    
    return NextResponse.json(participants);
  } catch (error) {
    console.error('Error fetching session participants:', error);
    return NextResponse.json(
      { error: 'Failed to fetch session participants' },
      { status: 500 }
    );
  }
}

// POST /api/session-participants - Add participants to session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, participants } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    if (!participants || !Array.isArray(participants) || participants.length === 0) {
      return NextResponse.json(
        { error: 'Participants are required' },
        { status: 400 }
      );
    }

    const addedParticipants = [];
    
    for (const participant of participants) {
      const { clientId, staffId, role, attendanceStatus } = participant;
      
      // Check if participant already exists
      const existing = await query(
        'SELECT id FROM session_participants WHERE session_id = ? AND (client_id = ? OR staff_id = ?)',
        [sessionId, clientId || null, staffId || null]
      );
      
      if (Array.isArray(existing) && existing.length > 0) {
        continue; // Skip if already added
      }
      
      // Add participant
      const result = await query(`
        INSERT INTO session_participants (session_id, client_id, staff_id, role, attendance_status)
        VALUES (?, ?, ?, ?, ?)
      `, [
        sessionId,
        clientId || null,
        staffId || null,
        role || 'participant',
        attendanceStatus || 'scheduled'
      ]);

      // Fetch participant details for logging
      let participantDetails = {
        session_id: sessionId,
        client_id: clientId || null,
        staff_id: staffId || null,
        role: role || 'participant',
        attendance_status: attendanceStatus || 'scheduled',
      };
      if (clientId) {
        const clientRows = await query('SELECT id, first_name, last_name, client_id FROM clients WHERE id = ?', [clientId]) as any[];
        if (Array.isArray(clientRows) && clientRows.length > 0) {
          const client = clientRows[0];
          participantDetails = {
            ...participantDetails,
            participant_type: 'client',
            participant_name: `${client.first_name} ${client.last_name}`,
            participant_identifier: client.client_id
          };
        }
      } else if (staffId) {
        const staffRows = await query('SELECT id, title, employee_id FROM staff WHERE id = ?', [staffId]) as any[];
        if (Array.isArray(staffRows) && staffRows.length > 0) {
          const staff = staffRows[0];
          participantDetails = {
            ...participantDetails,
            participant_type: 'staff',
            participant_name: staff.title,
            participant_identifier: staff.employee_id
          };
        }
      }

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
        action: 'add_participant',
        table_name: 'session_participants',
        record_id: (result as any).insertId,
        new_values: participantDetails as any,
        ip_address: ip,
        user_agent: userAgent,
      });
      
      addedParticipants.push({
        sessionId,
        clientId,
        staffId,
        role,
        participantId: (result as any).insertId
      });
    }

    return NextResponse.json({
      message: `Successfully added ${addedParticipants.length} participant(s) to session`,
      participants: addedParticipants
    });
  } catch (error) {
    console.error('Error adding session participants:', error);
    return NextResponse.json(
      { error: 'Failed to add session participants' },
      { status: 500 }
    );
  }
} 