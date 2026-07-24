import prisma from '../src/lib/prisma';

async function main() {
  const baseLat = 12.9716;
  const baseLng = 77.5946;
  
  const rolesList = ['Security', 'Usher', 'Bartender', 'Runner', 'Stagehand'];
  const tiers = ['TIER_1', 'TIER_2', 'TIER_3'];

  let credentials = '\n\n## Bangalore Test Workers\n\n| Email | Password | Tier | Roles |\n|---|---|---|---|\n';

  for (let i = 1; i <= 10; i++) {
    const lat = baseLat + (Math.random() - 0.5) * 0.1;
    const lng = baseLng + (Math.random() - 0.5) * 0.1;
    const tier = tiers[i % 3];
    const email = `bangalore.worker${i}@test.com`;
    const password = 'password123';
    const roles = [rolesList[i % rolesList.length], rolesList[(i+1) % rolesList.length]];
    
    // Check if exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (!existing) {
      const user = await prisma.user.create({
        data: {
          email,
          password,
          name: `Bangalore Worker ${i}`,
          role: 'WORKER',
          workerProfile: {
            create: {
              skills: 'Events',
              experience: '2 years',
              tier: tier,
              latitude: lat,
              longitude: lng,
              isVerified: true,
              categories: roles,
              location: 'Bangalore, India',
              rating: 4.0 + Math.random()
            }
          }
        }
      });
      console.log(`Created ${email}`);
    }
    
    credentials += `| ${email} | ${password} | ${tier} | ${roles.join(', ')} |\n`;
  }
  
  const fs = require('fs');
  fs.appendFileSync('DEMO_CREDENTIALS.md', credentials);
  console.log("Appended to DEMO_CREDENTIALS.md");
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
