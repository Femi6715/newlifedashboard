import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const action = searchParams.get('action') || '';
    const tableName = searchParams.get('table_name') || '';
    const userId = searchParams.get('user_id') || '';
    const startDate = searchParams.get('start_date') || '';
    const endDate = searchParams.get('end_date') || '';

    const offset = (page - 1) * limit;

    // Build WHERE clause
    let whereConditions = [];
    let params: any[] = [];

    if (search) {
      whereConditions.push(`(al.action LIKE ? OR al.table_name LIKE ? OR al.ip_address LIKE ?)`);
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (action) {
      whereConditions.push(`al.action = ?`);
      params.push(action);
    }

    if (tableName) {
      whereConditions.push(`al.table_name = ?`);
      params.push(tableName);
    }

    if (userId) {
      whereConditions.push(`al.user_id = ?`);
      params.push(parseInt(userId));
    }

    if (startDate) {
      whereConditions.push(`DATE(al.created_at) >= ?`);
      params.push(startDate);
    }

    if (endDate) {
      whereConditions.push(`DATE(al.created_at) <= ?`);
      params.push(endDate);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM activity_log al
      LEFT JOIN users u ON al.user_id = u.id
      ${whereClause}
    `;

    const countResult = await query(countQuery, params) as any[];
    const total = countResult[0]?.total || 0;

    // Get activity log data with user information
    const dataQuery = `
      SELECT 
        al.id,
        al.user_id,
        al.action,
        al.table_name,
        al.record_id,
        al.old_values,
        al.new_values,
        al.ip_address,
        al.user_agent,
        al.created_at,
        u.username,
        u.email,
        u.first_name,
        u.last_name,
        u.role
      FROM activity_log al
      LEFT JOIN users u ON al.user_id = u.id
      ${whereClause}
      ORDER BY al.created_at DESC
      LIMIT ${Number(limit)} OFFSET ${Number(offset)}
    `;

    // Always add limit and offset to params for the query
    const dataParams = params.concat([limit, offset]);
    console.log('Activity Log SQL:', dataQuery);
    console.log('Activity Log Params:', dataParams);
    const activityLogs = await query(dataQuery, dataParams) as any[];

    // Get unique actions and table names for filters
    const actionsQuery = `
      SELECT DISTINCT action 
      FROM activity_log 
      ORDER BY action
    `;
    const actions = await query(actionsQuery) as any[];

    const tableNamesQuery = `
      SELECT DISTINCT table_name 
      FROM activity_log 
      WHERE table_name IS NOT NULL
      ORDER BY table_name
    `;
    const tableNames = await query(tableNamesQuery) as any[];

    const usersQuery = `
      SELECT DISTINCT u.id, u.username, u.first_name, u.last_name
      FROM activity_log al
      JOIN users u ON al.user_id = u.id
      ORDER BY u.first_name, u.last_name
    `;
    const users = await query(usersQuery) as any[];

    return NextResponse.json({
      activityLogs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      filters: {
        actions: actions.map((a: any) => a.action),
        tableNames: tableNames.map((t: any) => t.table_name),
        users
      }
    });

  } catch (error) {
    console.error('Error fetching activity log:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity log' },
      { status: 500 }
    );
  }
} 