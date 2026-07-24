const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const workers = await prisma.user.findMany({
    where: { email: { startsWith: 'bangalore.worker' } },
    include: { workerProfile: true }
  });

  for (const w of workers) {
    if (w.workerProfile) {
      const categories = w.workerProfile.categories || [];
      if (!categories.includes('technician') && !categories.includes('Technician')) {
        categories.push('Technician');
        await prisma.workerProfile.update({
          where: { id: w.workerProfile.id },
          data: { categories: categories }
        });
      }
    }
  }
  console.log("Updated workers to include Technician role");
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
