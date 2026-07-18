const { createClient } = require('@libsql/client');
const path = require('path');

async function main() {
  const dbPath = path.join(__dirname, 'dev.db');
  const libsql = createClient({ url: `file:${dbPath.replace(/\\/g, '/')}` });
  
  try {
    // Check if user exists
    const res = await libsql.execute(`SELECT * FROM User WHERE email = 'admin@backstage.com'`);
    if (res.rows.length === 0) {
      const dateStr = new Date().toISOString();
      await libsql.execute({
        sql: `INSERT INTO User (id, email, password, name, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: ['admin-1234', 'admin@backstage.com', 'secureadminpassword123', 'Sys Admin', 'ADMIN', dateStr, dateStr]
      });
      console.log('Admin user created successfully.');
    } else {
      console.log('Admin user already exists.');
    }
  } catch (e) {
    console.error(e);
  }
}

main();
