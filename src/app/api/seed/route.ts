import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const baseLat = 12.9716;
  const baseLng = 77.5946;
  
  const rolesList = ['Security', 'Usher', 'Bartender', 'Runner', 'Stagehand'];
  const tiers = ['TIER_1', 'TIER_2', 'TIER_3'];

  let credentials = '\n\n## Bangalore Test Workers (Geospatial Demo)\n\n| Email | Password | Tier | Roles |\n|---|---|---|---|\n';

  for (let i = 1; i <= 10; i++) {
    const lat = baseLat + (Math.random() - 0.5) * 0.1;
    const lng = baseLng + (Math.random() - 0.5) * 0.1;
    const tier = tiers[i % 3];
    const email = `bangalore.worker${i}@test.com`;
    const password = 'password123';
    const roles = [rolesList[i % rolesList.length], rolesList[(i+1) % rolesList.length]];
    
    // Check if exists
    const existing = await prisma.user.findUnique({ where: { email }, include: { workerProfile: true } });
    if (!existing) {
      await prisma.user.create({
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
              categories: [...roles, 'technician'],
              rating: 4.0 + Math.random()
            }
          }
        }
      });
    } else if (existing.workerProfile) {
      // Update existing to have technician
      const cats = existing.workerProfile.categories || [];
      if (!cats.includes('technician') && !cats.includes('Technician')) {
        await prisma.workerProfile.update({
          where: { id: existing.workerProfile.id },
          data: { categories: [...cats, 'technician'] }
        });
      }
    }
    
    credentials += `| ${email} | ${password} | ${tier} | ${roles.join(', ')} |\n`;
  }
  
  fs.appendFileSync(path.join(process.cwd(), 'DEMO_CREDENTIALS.md'), credentials);
  
  return NextResponse.json({ success: true });
}
