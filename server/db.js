import mysql from 'mysql2/promise';

let pool;

export function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      timezone: 'Z',
      decimalNumbers: true,
    });

    console.log('Connecting to database with the following details:');
    console.log(`Host: ${process.env.DB_HOST}`);
    console.log(`User: ${process.env.DB_USER}`);
    console.log(`Database: ${process.env.DB_NAME}`);
    console.log(`Port: ${process.env.DB_PORT || 3306}`);

    // Heartbeat
    setInterval(() => {
      pool.query('SELECT 1').catch((err) => {
        console.error('[DB Heartbeat Error]', err);
      });
    }, 5000);
  }
  return pool;
}

export async function query(sql, params = []) {
  try {
    const [rows] = await getPool().execute(sql, params);
    return rows;
  } catch (err) {
    // Gracefully handle duplicate column errors during schema sync
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.warn(`[DB Schema Sync] Ignoring duplicate column: ${err.sqlMessage}`);
      return;
    }
    console.error('[DB Query Error]', err);
    throw err;
  }
}

