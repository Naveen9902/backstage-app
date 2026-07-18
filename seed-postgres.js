require('dotenv').config();
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting seed...');

  // 1. Admin
  await prisma.user.upsert({
    where: { email: 'admin@backstage.com' },
    update: {},
    create: {
      email: 'admin@backstage.com',
      password: 'secureadminpassword123',
      name: 'Sys Admin',
      role: 'ADMIN',
    },
  });
  console.log('Admin user seeded.');

  // 2. Manager
  const manager = await prisma.user.upsert({
    where: { email: 'manager@backstage.com' },
    update: {},
    create: {
      email: 'manager@backstage.com',
      password: 'manager123',
      name: 'John Doe (Manager)',
      role: 'MANAGER',
    },
  });

  await prisma.managerProfile.upsert({
    where: { userId: manager.id },
    update: {},
    create: {
      userId: manager.id,
      company: 'LiveNation',
      bio: 'Event manager for major concerts.',
    },
  });
  console.log('Manager user seeded.');

  // 3. Worker
  const worker = await prisma.user.upsert({
    where: { email: 'worker@backstage.com' },
    update: {},
    create: {
      email: 'worker@backstage.com',
      password: 'worker123',
      name: 'Sarah (Talent)',
      role: 'WORKER',
    },
  });

  await prisma.workerProfile.upsert({
    where: { userId: worker.id },
    update: {},
    create: {
      userId: worker.id,
      skills: 'Serving, Bartending',
      experience: '3 years',
      category: 'Hospitality',
      isVerified: false,
    },
  });
  console.log('Worker user seeded.');
}

main()
  .then(() => {
    console.log('Database seeding completed successfully!');
    process.exit(0);
  })
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  });
