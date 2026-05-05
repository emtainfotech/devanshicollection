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
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000
    });

    pool.on('error', (err) => {
      console.error('[DB Pool Error]', err);
      if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ECONNRESET') {
        pool = null; // Clear pool so it recreates on next request
      }
    });

    console.log('Connecting to database with the following details:');
    console.log(`Host: ${process.env.DB_HOST}`);
    console.log(`User: ${process.env.DB_USER}`);
    console.log(`Database: ${process.env.DB_NAME}`);
    console.log(`Port: ${process.env.DB_PORT || 3306}`);

    // Heartbeat
    setInterval(() => {
      if (pool) {
        pool.query('SELECT 1').catch((err) => {
          console.error('[DB Heartbeat Error]', err);
          if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ECONNRESET') {
            pool = null;
          }
        });
      }
    }, 10000);
  }
  return pool;
}

export async function query(sql, params = [], retries = 2) {
  try {
    const [rows] = await getPool().execute(sql, params);
    return rows;
  } catch (err) {
    if (retries > 0 && (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT')) {
      console.warn(`[DB Query Retry] ${err.code}, retrying... (${retries} left)`);
      pool = null; // Force pool recreation
      return await query(sql, params, retries - 1);
    }
    // Gracefully handle duplicate column errors during schema sync
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.warn(`[DB Schema Sync] Ignoring duplicate column: ${err.sqlMessage}`);
      return;
    }
    console.error('[DB Query Error]', err);
    throw err;
  }
}

