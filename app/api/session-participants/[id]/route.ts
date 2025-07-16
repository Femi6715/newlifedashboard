import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { logActivity } from '@/lib/db-pool';

// DELETE /api/session-participants/[id] - Delete a session participant
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const participantId = parseInt(params.id);
    
    if (isNaN(participantId)) {
      return NextResponse.json(
        { error: 'Invalid participant ID' },
        { status: 400 }
      );
    }

    // Check if participant exists
    const existing = await query(
      'SELECT * FROM session_participants WHERE id = ?',
      [participantId]
    );

    if (!Array.isArray(existing) || existing.length === 0) {
      return NextResponse.json(
        { error: 'Session participant not found' },
        { status: 404 }
      );
    }

    const participant = existing[0];

    // Fetch participant details for logging
    let participantDetails = { ...participant };
    if ((participant as any).client_id) {
      const clientRows = await query('SELECT id, first_name, last_name, client_id FROM clients WHERE id = ?', [(participant as any).client_id]) as any[];
      if (Array.isArray(clientRows) && clientRows.length > 0) {
        const client = clientRows[0];
        participantDetails = {
          ...participantDetails,
          participant_type: 'client',
          participant_name: `${client.first_name} ${client.last_name}`,
          participant_identifier: client.client_id
        };
      }
    } else if ((participant as any).staff_id) {
      const staffRows = await query('SELECT id, title, employee_id FROM staff WHERE id = ?', [(participant as any).staff_id]) as any[];
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

    // Delete the participant
    await query(
      'DELETE FROM session_participants WHERE id = ?',
      [participantId]
    );

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
      action: 'remove_participant',
      table_name: 'session_participants',
      record_id: participantId,
      old_values: participantDetails as any,
      ip_address: ip,
      user_agent: userAgent,
    });

    return NextResponse.json({ 
      message: 'Session participant deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting session participant:', error);
    return NextResponse.json(
      { error: 'Failed to delete session participant' },
      { status: 500 }
    );
  }
} 