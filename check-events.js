const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const events = await p.event.findMany({ take: 5 });
  console.log('Total events in Supabase DB:', events.length);
  if (events.length > 0) {
    console.log('Sample event:', JSON.stringify(events[0], null, 2));
  } else {
    console.log('NO EVENTS FOUND - database needs seeding');
  }
}

main().catch(console.error).finally(() => p.$disconnect());
