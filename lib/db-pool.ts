import mysql from 'mysql2/promise';

// Database connection pool configuration
const poolConfig = {
  host: 'localhost',
  user: 'root',
  password: '62221085',
  database: 'newlife_recovery_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
  charset: 'utf8mb4'
};

// Create connection pool
const pool = mysql.createPool(poolConfig);

// Test the connection
pool.getConnection()
  .then(connection => {
    console.log('Database pool connected successfully');
    connection.release();
  })
  .catch(err => {
    console.error('Database pool connection failed:', err);
  });

// Utility function to execute queries using the pool
export async function query(sql: string, params?: any[]) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

// Type for logActivity parameters
export interface LogActivityParams {
  user_id?: number | null;
  action: string;
  table_name?: string | null;
  record_id?: number | null;
  old_values?: any;
  new_values?: any;
  ip_address?: string | null;
  user_agent?: string | null;
}

/**
 * Logs an activity to the activity_log table.
 * @param {LogActivityParams} params - Activity log parameters
 */
export async function logActivity({
  user_id = null,
  action,
  table_name = null,
  record_id = null,
  old_values = null,
  new_values = null,
  ip_address = null,
  user_agent = null,
}: LogActivityParams) {
  if (!action) throw new Error('Action is required for activity log');
  const sql = `
    INSERT INTO activity_log
      (user_id, action, table_name, record_id, old_values, new_values, ip_address, user_agent, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
  `;
  const params = [
    user_id,
    action,
    table_name,
    record_id,
    old_values ? JSON.stringify(old_values) : null,
    new_values ? JSON.stringify(new_values) : null,
    ip_address,
    user_agent,
  ];
  await query(sql, params);
}

export default pool; 