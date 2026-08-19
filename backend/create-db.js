import pg from 'pg';

async function checkAndCreate() {
  const pool = new pg.Pool({
    user: 'postgres',
    password: 'Data1234#$..',
    host: 'localhost',
    port: 5432,
    database: 'postgres',
  });

  try {
    const res = await pool.query("SELECT 1 FROM pg_database WHERE datname = 'civic_pulse'");
    if (res.rows.length === 0) {
      await pool.query("CREATE DATABASE civic_pulse");
      console.log("✅ Database 'civic_pulse' created successfully in PostgreSQL!");
    } else {
      console.log("✅ Database 'civic_pulse' already exists in PostgreSQL!");
    }
  } catch (err) {
    console.error("Database check error:", err.message);
  } finally {
    await pool.end();
  }
}

checkAndCreate();
