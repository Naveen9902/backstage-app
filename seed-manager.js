const { createClient } = require('@libsql/client');
const path = require('path');

async function main() {
  const dbPath = path.join(__dirname, 'dev.db');
  const libsql = createClient({ url: `file:${dbPath.replace(/\\/g, '/')}` });
  
  try {
    const res = await libsql.execute(`SELECT * FROM User WHERE email = 'manager@backstage.com'`);
    if (res.rows.length === 0) {
      const dateStr = new Date().toISOString();
      await libsql.execute({
        sql: `INSERT INTO User (id, email, password, name, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: ['manager-1234', 'manager@backstage.com', 'manager123', 'John Doe (Manager)', 'MANAGER', dateStr, dateStr]
      });
      console.log('Manager user created successfully.');
    } else {
      console.log('Manager user already exists.');
    }
  } catch (e) {
    console.error(e);
  }
}

main();
