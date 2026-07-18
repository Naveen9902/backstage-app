require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query('SELECT id, title FROM "Event"').then(res => {
  console.log(res.rows);
  process.exit(0);
});
