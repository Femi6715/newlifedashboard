import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET /api/case-files - Fetch all case files
export async function GET() {
  try {
    console.log('Attempting to fetch case files from database...');
    const caseFiles = await query(`
      SELECT 
        cf.id,
        cf.client_id,
        cf.file_type,
        cf.title,
        cf.description,
        cf.file_path,
        cf.file_size,
        cf.uploaded_by,
        cf.status,
        cf.created_at,
        cf.updated_at,
        c.first_name as client_first_name,
        c.last_name as client_last_name,
        c.client_id as client_identifier,
        u.first_name as uploaded_by_name
      FROM case_files cf
      LEFT JOIN clients c ON cf.client_id = c.id
      LEFT JOIN users u ON cf.uploaded_by = u.id
      ORDER BY cf.created_at DESC
    `);
    
    console.log(`Successfully fetched ${Array.isArray(caseFiles) ? caseFiles.length : 0} case files`);
    return NextResponse.json(caseFiles);
  } catch (error) {
    console.error('Error fetching case files:', error);
    console.error('Error stack:', (error as Error)?.stack);
    console.error('Error message:', (error as Error)?.message);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch case files', 
        details: (error as Error)?.message || 'Unknown error',
        stack: (error as Error)?.stack 
      },
      { status: 500 }
    );
  }
}

// POST /api/case-files - Create a new case file
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const result = await query(`
      INSERT INTO case_files (
        client_id,
        file_type,
        title,
        description,
        file_path,
        file_size,
        uploaded_by,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      body.clientId,
      body.fileType,
      body.title,
      body.description || null,
      body.filePath || null,
      body.fileSize || null,
      body.uploadedBy || null,
      body.status || 'active',
    ]);
    
    // Fetch the created case file
    const createdCaseFile = await query(`
      SELECT 
        cf.*,
        c.first_name as client_first_name,
        c.last_name as client_last_name,
        c.client_id as client_identifier,
        u.first_name as uploaded_by_name
      FROM case_files cf
      LEFT JOIN clients c ON cf.client_id = c.id
      LEFT JOIN users u ON cf.uploaded_by = u.id
      WHERE cf.id = ?
    `, [(result as any).insertId]);
    
    return NextResponse.json(Array.isArray(createdCaseFile) ? createdCaseFile[0] : createdCaseFile, { status: 201 });
  } catch (error) {
    console.error('Error creating case file:', error);
    return NextResponse.json(
      { error: 'Failed to create case file' },
      { status: 500 }
    );
  }
} 