import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// Helper function to format dates for MySQL
const formatDateForMySQL = (dateString: string | null) => {
  if (!dateString) return null;
  try {
    const date = new Date(dateString);
    // Check if it's a valid date
    if (isNaN(date.getTime())) return null;
    // Return in YYYY-MM-DD format for MySQL
    return date.toISOString().split('T')[0];
  } catch {
    return null;
  }
};

// GET /api/clients/[id] - Fetch a specific client
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const clients = await query(`
      SELECT * FROM clients WHERE id = ?
    `, [parseInt(params.id)]);
    
    if (!Array.isArray(clients) || clients.length === 0) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(clients[0]);
  } catch (error) {
    console.error('Error fetching client:', error);
    return NextResponse.json(
      { error: 'Failed to fetch client' },
      { status: 500 }
    );
  }
}

// PUT /api/clients/[id] - Update a client
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    console.log('Updating client with data:', body);
    
    // Validate required fields
    if (!body.client_id || !body.first_name || !body.last_name) {
      return NextResponse.json(
        { error: 'Client ID, first name, and last name are required' },
        { status: 400 }
      );
    }
    
    await query(`
      UPDATE clients SET 
        client_id = ?,
        first_name = ?,
        last_name = ?,
        date_of_birth = ?,
        gender = ?,
        email = ?,
        phone = ?,
        emergency_contact_name = ?,
        emergency_contact_phone = ?,
        address = ?,
        insurance_provider = ?,
        insurance_policy_number = ?,
        primary_diagnosis = ?,
        admission_date = ?,
        discharge_date = ?,
        status = ?,
        progress_percentage = ?,
        notes = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      body.client_id,
      body.first_name,
      body.last_name,
      formatDateForMySQL(body.date_of_birth),
      body.gender || null,
      body.email || null,
      body.phone || null,
      body.emergency_contact_name || null,
      body.emergency_contact_phone || null,
      body.address || null,
      body.insurance_provider || null,
      body.insurance_policy_number || null,
      body.primary_diagnosis || null,
      formatDateForMySQL(body.admission_date),
      formatDateForMySQL(body.discharge_date),
      body.status || 'active',
      body.progress_percentage || 0,
      body.notes || null,
      parseInt(params.id)
    ]);
    
    // Fetch the updated client
    const updatedClients = await query(`
      SELECT * FROM clients WHERE id = ?
    `, [parseInt(params.id)]);
    
    if (!Array.isArray(updatedClients) || updatedClients.length === 0) {
      return NextResponse.json(
        { error: 'Client not found after update' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(updatedClients[0]);
  } catch (error) {
    console.error('Error updating client:', error);
    return NextResponse.json(
      { error: 'Failed to update client' },
      { status: 500 }
    );
  }
}

// DELETE /api/clients/[id] - Delete a client
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await query(`
      DELETE FROM clients WHERE id = ?
    `, [parseInt(params.id)]);
    
    return NextResponse.json({ message: 'Client deleted successfully' });
  } catch (error) {
    console.error('Error deleting client:', error);
    return NextResponse.json(
      { error: 'Failed to delete client' },
      { status: 500 }
    );
  }
} 