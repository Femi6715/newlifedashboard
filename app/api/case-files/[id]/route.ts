import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET /api/case-files/[id] - Fetch a specific case file
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const caseFile = await query(`
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
    `, [parseInt(params.id)]);
    
    if (!Array.isArray(caseFile) || caseFile.length === 0) {
      return NextResponse.json(
        { error: 'Case file not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(caseFile[0]);
  } catch (error) {
    console.error('Error fetching case file:', error);
    return NextResponse.json(
      { error: 'Failed to fetch case file' },
      { status: 500 }
    );
  }
}

// PUT /api/case-files/[id] - Update a case file
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    await query(`
      UPDATE case_files SET 
        client_id = ?,
        file_type = ?,
        title = ?,
        description = ?,
        file_path = ?,
        file_size = ?,
        uploaded_by = ?,
        status = ?
      WHERE id = ?
    `, [
      body.clientId,
      body.fileType,
      body.title,
      body.description || null,
      body.filePath || null,
      body.fileSize || null,
      body.uploadedBy || null,
      body.status || 'active',
      parseInt(params.id)
    ]);
    
    // Fetch the updated case file
    const updatedCaseFile = await query(`
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
    `, [parseInt(params.id)]);
    
    return NextResponse.json(Array.isArray(updatedCaseFile) ? updatedCaseFile[0] : updatedCaseFile);
  } catch (error) {
    console.error('Error updating case file:', error);
    return NextResponse.json(
      { error: 'Failed to update case file' },
      { status: 500 }
    );
  }
}

// DELETE /api/case-files/[id] - Delete a case file
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await query(`
      DELETE FROM case_files WHERE id = ?
    `, [parseInt(params.id)]);
    
    return NextResponse.json({ message: 'Case file deleted successfully' });
  } catch (error) {
    console.error('Error deleting case file:', error);
    return NextResponse.json(
      { error: 'Failed to delete case file' },
      { status: 500 }
    );
  }
} 