import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const pool = new Pool({ connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL, max: 1 });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function seedAdmin() {
  const email = 'admin@backstage.com';
  const name = 'admin';
  const password = 'Naveen9902@backstage';
  const hashedPassword = await bcrypt.hash(password, 12);

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    await prisma.user.update({
      where: { email },
      data: { name, password: hashedPassword, role: 'ADMIN' }
    });
    console.log(`✅ Admin account updated: ${email}`);
  } else {
    await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: 'ADMIN',
      }
    });
    console.log(`✅ Admin account created: ${email}`);
  }

  console.log(`   Name:     ${name}`);
  console.log(`   Email:    ${email}`);
  console.log(`   Password: [hashed & stored securely]`);

  await prisma.$disconnect();
  await pool.end();
}

seedAdmin().catch(async (e) => {
  console.error('❌ Failed:', e.message);
  await prisma.$disconnect();
  await pool.end();
  process.exit(1);
});
