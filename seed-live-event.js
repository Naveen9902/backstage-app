const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const dotenv = require('dotenv');
dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function seedLiveEvent() {
  try {
    // Get manager and worker
    const manager = await prisma.user.findUnique({ where: { email: 'manager@backstage.com' } });
    const worker = await prisma.user.findUnique({
      where: { email: 'worker@backstage.com' },
      include: { workerProfile: true }
    });

    if (!manager || !worker || !worker.workerProfile) {
      throw new Error('Manager or Worker not found. Run npm run seed first.');
    }

    // Create a live event happening TODAY
    const now = new Date();
    const eventStart = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes from now

    const event = await prisma.event.create({
      data: {
        managerId: manager.id,
        title: '🎬 LIVE: Grand Product Launch Gala',
        description: 'A high-profile product launch event happening right now. All hands on deck!',
        date: eventStart,
        location: 'Grand Ballroom, Hotel Prestige, Mumbai',
      }
    });

    console.log('✅ Created live event:', event.title, 'at', event.location);

    // Create staffing request for this event
    const staffingReq = await prisma.staffingRequest.create({
      data: {
        eventId: event.id,
        roleName: 'Stage Crew',
        quantity: 3,
        payRate: 1500,
      }
    });

    console.log('✅ Created staffing request: Stage Crew');

    // Apply and immediately ACCEPT the worker
    const application = await prisma.application.create({
      data: {
        workerProfileId: worker.workerProfile.id,
        staffingRequestId: staffingReq.id,
        status: 'ACCEPTED',
      }
    });

    console.log('✅ Accepted worker:', worker.name, 'for the event');

    console.log('\n========================================');
    console.log('🚀 LIVE EVENT READY FOR TESTING!');
    console.log('========================================');
    console.log('Event ID:', event.id);
    console.log('Event Title:', event.title);
    console.log('Event Time:', eventStart.toLocaleString());
    console.log('\n📋 HOW TO TEST:');
    console.log('1. Login as MANAGER → Go to Runners Dispatch → Dispatch a task for this event');
    console.log('2. Login as WORKER → Go to "Live Runner Tasks" → Accept and complete the task');
    console.log('3. Go to Event Chat to communicate!');
    console.log('\nManager: manager@backstage.com / manager123');
    console.log('Worker:  worker@backstage.com  / worker123');
    console.log('========================================');

  } catch (e) {
    console.error('Error seeding live event:', e);
  } finally {
    await prisma.$disconnect();
  }
}

seedLiveEvent();
