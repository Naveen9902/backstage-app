const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log("Users:", users.length);
  const manager = await prisma.user.findUnique({ where: { email: 'manager@backstage.com' } });
  console.log("Manager:", manager ? manager.email : "Not found");
}

main().catch(console.error).finally(() => prisma.$disconnect());
