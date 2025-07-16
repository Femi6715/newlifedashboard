import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '62221085',
  database: 'newlife_recovery_db',
  port: 3306,
};

export async function getConnection() {
  return await mysql.createConnection(dbConfig);
}

export async function query(sql: string, params?: any[]) {
  const connection = await getConnection();
  try {
    const [rows] = await connection.execute(sql, params);
    return rows;
  } finally {
    await connection.end();
  }
} 