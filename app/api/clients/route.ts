import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET /api/clients - Fetch all clients
export async function GET() {
  try {
    console.log('Attempting to fetch clients from database...');
    const clients = await query(`
      SELECT 
        id,
        client_id,
        first_name,
        last_name,
        email,
        phone,
        status,
        progress_percentage,
        admission_date,
        created_at,
        updated_at
      FROM clients 
      ORDER BY created_at DESC
    `);
    
    console.log(`Successfully fetched ${Array.isArray(clients) ? clients.length : 0} clients`);
    return NextResponse.json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    console.error('Error stack:', (error as Error)?.stack);
    console.error('Error message:', (error as Error)?.message);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch clients', 
        details: (error as Error)?.message || 'Unknown error',
        stack: (error as Error)?.stack 
      },
      { status: 500 }
    );
  }
}

// POST /api/clients - Create a new client
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const result = await query(`
      INSERT INTO clients (
        client_id, 
        first_name, 
        last_name, 
        email, 
        phone, 
        status, 
        progress_percentage, 
        admission_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      body.clientId,
      body.firstName,
      body.lastName,
      body.email,
      body.phone,
      body.status || 'active',
      body.progress || 0,
      body.admissionDate ? new Date(body.admissionDate) : null,
    ]);
    
    // Fetch the created client
    const createdClient = await query(`
      SELECT * FROM clients WHERE id = ?
    `, [(result as any).insertId]);
    
    return NextResponse.json(Array.isArray(createdClient) ? createdClient[0] : createdClient, { status: 201 });
  } catch (error) {
    console.error('Error creating client:', error);
    return NextResponse.json(
      { error: 'Failed to create client' },
      { status: 500 }
    );
  }
} 