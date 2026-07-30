/**
 * auto-archive.ts
 * 
 * Archives old events (>30 days) and their related data to CSV files,
 * then deletes them from Supabase to keep the free tier under 500 MB.
 * 
 * Usage:
 *   Dry run (backup only, NO deletion):  npx tsx scripts/auto-archive.ts
 *   Live run (backup + delete):          npx tsx scripts/auto-archive.ts --delete
 */

import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

// Force direct connection (port 5432) to bypass PgBouncer and RLS restrictions.
// This MUST be declared before any Prisma client is instantiated.
const directUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
const pool = new Pool({ connectionString: directUrl, max: 1 });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
import fs from 'fs';
import path from 'path';

const DRY_RUN = !process.argv.includes('--delete');

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

function jsonToCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const lines = [
    headers.join(','),
    ...rows.map(row =>
      headers.map(h => {
        const val = row[h];
        if (val === null || val === undefined) return '';
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      }).join(',')
    )
  ];
  return lines.join('\n');
}

function saveArchive(label: string, rows: Record<string, unknown>[], archiveDir: string): void {
  if (rows.length === 0) {
    console.log(`  ↪ No ${label} to archive.`);
    return;
  }
  const filename = path.join(archiveDir, `${label}.csv`);
  fs.writeFileSync(filename, jsonToCsv(rows), 'utf8');
  console.log(`  ✅ Archived ${rows.length} ${label} → ${filename}`);
}

// ─────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────

async function autoArchive() {
  console.log('');
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║       BackStage Auto-Archive Script          ║');
  if (DRY_RUN) {
    console.log('║   MODE: DRY RUN — No data will be deleted    ║');
  } else {
    console.log('║   MODE: LIVE — DATA WILL BE DELETED          ║');
  }
  console.log('╚══════════════════════════════════════════════╝');
  console.log('');

  // ── 1. Create archive directory with timestamp ───────────
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const archiveDir = path.join(process.cwd(), 'archives', timestamp);
  fs.mkdirSync(archiveDir, { recursive: true });
  console.log(`📁 Archive directory: ${archiveDir}`);
  console.log('');

  // ── 2. Find old events (date > 30 days ago) ──────────────
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 30);

  console.log(`🔍 Finding events that ended before: ${cutoffDate.toDateString()}`);

  const oldEvents = await prisma.event.findMany({
    where: {
      date: { lt: cutoffDate }
    },
    select: {
      id: true,
      title: true,
      date: true,
      status: true,
      location: true,
      managerId: true,
    }
  });

  if (oldEvents.length === 0) {
    console.log('✅ No events older than 30 days found. Database is clean!');
    await prisma.$disconnect();
    return;
  }

  console.log(`📦 Found ${oldEvents.length} old events to archive.`);
  const oldEventIds = oldEvents.map(e => e.id);

  // ── 3. Fetch all related data ─────────────────────────────
  console.log('');
  console.log('📥 Fetching related data...');

  const [chatMessages, dispatches, staffingRequests, applications] = await Promise.all([
    prisma.eventChatMessage.findMany({
      where: { eventId: { in: oldEventIds } }
    }),

    prisma.runnerDispatch.findMany({
      where: { eventId: { in: oldEventIds } }
    }),

    prisma.staffingRequest.findMany({
      where: { eventId: { in: oldEventIds } }
    }),

    prisma.application.findMany({
      where: {
        staffingRequest: { eventId: { in: oldEventIds } }
      }
    })
  ]);

  console.log(`   Events:          ${oldEvents.length}`);
  console.log(`   Chat Messages:   ${chatMessages.length}`);
  console.log(`   Runner Dispatches: ${dispatches.length}`);
  console.log(`   Staffing Requests: ${staffingRequests.length}`);
  console.log(`   Applications:    ${applications.length}`);

  // ── 4. Save CSVs ──────────────────────────────────────────
  console.log('');
  console.log('💾 Saving CSV archives...');

  saveArchive('events', oldEvents as Record<string, unknown>[], archiveDir);
  saveArchive('chat_messages', chatMessages as Record<string, unknown>[], archiveDir);
  saveArchive('runner_dispatches', dispatches as Record<string, unknown>[], archiveDir);
  saveArchive('staffing_requests', staffingRequests as Record<string, unknown>[], archiveDir);
  saveArchive('applications', applications as Record<string, unknown>[], archiveDir);

  // ── 5. Summary file ───────────────────────────────────────
  const summary = {
    archivedAt: new Date().toISOString(),
    cutoffDate: cutoffDate.toISOString(),
    counts: {
      events: oldEvents.length,
      chatMessages: chatMessages.length,
      runnerDispatches: dispatches.length,
      staffingRequests: staffingRequests.length,
      applications: applications.length,
    },
    eventTitles: oldEvents.map(e => ({ id: e.id, title: e.title, date: e.date })),
  };
  fs.writeFileSync(
    path.join(archiveDir, 'summary.json'),
    JSON.stringify(summary, null, 2),
    'utf8'
  );
  console.log(`  ✅ Saved archive summary → ${path.join(archiveDir, 'summary.json')}`);

  // ── 6. Delete from DB (only if --delete flag is passed) ───
  if (DRY_RUN) {
    console.log('');
    console.log('🟡 DRY RUN complete. CSVs saved. No data was deleted.');
    console.log('   To run the live deletion, execute:');
    console.log('   npx tsx scripts/auto-archive.ts --delete');
    console.log('');
    await prisma.$disconnect();
    return;
  }

  console.log('');
  console.log('🗑️  Deleting old data from Supabase (in safe order)...');

  await prisma.$transaction(async (tx) => {
    // Get application IDs to delete their payment transactions first
    const applicationIds = applications.map(a => a.id);
    
    // Delete payment transactions linked to old applications
    const deletedPayments = await tx.paymentTransaction.deleteMany({
      where: { applicationId: { in: applicationIds } }
    });
    console.log(`   Deleted ${deletedPayments.count} PaymentTransactions`);

    // Delete message likes before messages (chat message likes)
    const chatMessageIds = chatMessages.map(m => m.id);
    const deletedLikes = await tx.messageLike.deleteMany({
      where: { messageId: { in: chatMessageIds } }
    });
    console.log(`   Deleted ${deletedLikes.count} MessageLikes`);

    // 1st: Applications
    const deletedApps = await tx.application.deleteMany({
      where: { id: { in: applicationIds } }
    });
    console.log(`   Deleted ${deletedApps.count} Applications`);

    // 2nd: StaffingRequests
    const staffingIds = staffingRequests.map(s => s.id);
    const deletedStaffing = await tx.staffingRequest.deleteMany({
      where: { id: { in: staffingIds } }
    });
    console.log(`   Deleted ${deletedStaffing.count} StaffingRequests`);

    // 3rd: RunnerDispatches
    const dispatchIds = dispatches.map(d => d.id);
    const deletedDispatches = await tx.runnerDispatch.deleteMany({
      where: { id: { in: dispatchIds } }
    });
    console.log(`   Deleted ${deletedDispatches.count} RunnerDispatches`);

    // 4th: ChatMessages (replies first due to self-relation)
    await tx.eventChatMessage.deleteMany({
      where: { eventId: { in: oldEventIds }, parentId: { not: null } }
    });
    await tx.eventChatMessage.deleteMany({
      where: { eventId: { in: oldEventIds } }
    });
    console.log(`   Deleted ${chatMessages.length} EventChatMessages`);

    // 5th: The Events themselves
    const deletedEvents = await tx.event.deleteMany({
      where: { id: { in: oldEventIds } }
    });
    console.log(`   Deleted ${deletedEvents.count} Events`);
  });

  console.log('');
  console.log('🎉 Archive complete! Old events have been backed up and removed from Supabase.');
  console.log(`   Your CSV backups are stored in: ${archiveDir}`);
  console.log('');

  await prisma.$disconnect();
}

autoArchive().catch(async (err) => {
  console.error('❌ Archive failed:', err);
  await prisma.$disconnect();
  process.exit(1);
});
