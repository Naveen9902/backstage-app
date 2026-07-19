const { createClient } = require('@libsql/client');
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
require('dotenv').config();

const sqlite = createClient({ url: 'file:dev.db' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function migrate() {
  console.log('Migrating data from SQLite to Postgres...');
  
  try {
    await prisma.application.deleteMany({});
    await prisma.runnerDispatch.deleteMany({});
    await prisma.eventChatMessage.deleteMany({});
    await prisma.review.deleteMany({});
    await prisma.dispute.deleteMany({});
    await prisma.notification.deleteMany({});
    await prisma.staffingRequest.deleteMany({});
    await prisma.event.deleteMany({});
    await prisma.managerProfile.deleteMany({});
    await prisma.workerProfile.deleteMany({});
    await prisma.user.deleteMany({});
    console.log('Wiped existing Postgres data to cleanly import SQLite data.');
  } catch (e) {
    console.log('Failed to wipe data:', e.message);
  }
  
  // Migrate Users
  try {
    const users = await sqlite.execute('SELECT * FROM User');
    console.log(`Found ${users.rows.length} users in SQLite.`);
    for (const row of users.rows) {
      await prisma.user.upsert({
        where: { email: row.email },
        update: {},
        create: {
          id: row.id,
          email: row.email,
          password: row.password,
          name: row.name,
          role: row.role,
          createdAt: new Date(row.createdAt),
          updatedAt: new Date(row.updatedAt)
        }
      });
    }
  } catch (err) {
    console.log('Error migrating users:', err.message);
  }
  
  // Migrate Events
  try {
    const events = await sqlite.execute('SELECT * FROM Event');
    console.log(`Found ${events.rows.length} events in SQLite.`);
    for (const row of events.rows) {
      await prisma.event.upsert({
        where: { id: row.id },
        update: {},
        create: {
          id: row.id,
          title: row.title,
          description: row.description,
          location: row.location,
          date: new Date(row.date),
          startTime: row.startTime || null,
          managerId: row.managerId,
          createdAt: new Date(row.createdAt)
        }
      });
    }
  } catch (err) {
    console.log('Error migrating events:', err.message);
  }

  // Migrate Staffing Requests
  try {
    const reqs = await sqlite.execute('SELECT * FROM StaffingRequest');
    console.log(`Found ${reqs.rows.length} staffing requests.`);
    for (const row of reqs.rows) {
      await prisma.staffingRequest.upsert({
        where: { id: row.id },
        update: {},
        create: {
          id: row.id,
          eventId: row.eventId,
          roleName: row.roleName,
          quantity: row.quantity,
          payRate: row.payRate || 0.0
        }
      });
    }
  } catch (err) {
    console.log('Error migrating staffing requests:', err.message);
  }

  console.log('Migration complete!');
}

migrate().catch(console.error).finally(() => {
  prisma.$disconnect();
  process.exit(0);
});
