import prisma from '../src/lib/prisma';
import * as fs from 'fs';
import * as path from 'path';

// Configure the threshold (e.g., 1 month ago)
const MONTHS_TO_KEEP = 1;

async function main() {
  console.log(`Starting archive process for events older than ${MONTHS_TO_KEEP} months...`);

  const thresholdDate = new Date();
  thresholdDate.setMonth(thresholdDate.getMonth() - MONTHS_TO_KEEP);

  // 1. Find old events
  const oldEvents = await prisma.event.findMany({
    where: {
      date: {
        lt: thresholdDate
      }
    },
    include: {
      staffingRequests: {
        include: {
          applications: true
        }
      },
      runnerDispatches: true
    }
  });

  if (oldEvents.length === 0) {
    console.log("No old events found to archive. Exiting.");
    return;
  }

  console.log(`Found ${oldEvents.length} old events to archive.`);

  // 2. Prepare Data for CSV
  const eventsToCsv = [];
  const applicationsToCsv = [];

  for (const event of oldEvents) {
    eventsToCsv.push({
      id: event.id,
      title: event.title.replace(/,/g, ''), // remove commas for CSV safety
      date: event.date.toISOString(),
      status: event.status,
      managerId: event.managerId
    });

    for (const req of event.staffingRequests) {
      for (const app of req.applications) {
        applicationsToCsv.push({
          id: app.id,
          eventId: event.id,
          workerProfileId: app.workerProfileId,
          status: app.status,
          createdAt: app.createdAt.toISOString()
        });
      }
    }
  }

  // 3. Write to CSV files
  const backupDir = path.join(process.cwd(), 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir);
  }

  const timestamp = Date.now();
  
  if (eventsToCsv.length > 0) {
    const eventsHeader = "id,title,date,status,managerId\n";
    const eventsRows = eventsToCsv.map(e => `${e.id},${e.title},${e.date},${e.status},${e.managerId}`).join("\n");
    const eventsPath = path.join(backupDir, `events_archive_${timestamp}.csv`);
    fs.writeFileSync(eventsPath, eventsHeader + eventsRows);
    console.log(`✅ Saved ${eventsToCsv.length} events to ${eventsPath}`);
  }

  if (applicationsToCsv.length > 0) {
    const appsHeader = "id,eventId,workerProfileId,status,createdAt\n";
    const appsRows = applicationsToCsv.map(a => `${a.id},${a.eventId},${a.workerProfileId},${a.status},${a.createdAt}`).join("\n");
    const appsPath = path.join(backupDir, `applications_archive_${timestamp}.csv`);
    fs.writeFileSync(appsPath, appsHeader + appsRows);
    console.log(`✅ Saved ${applicationsToCsv.length} applications to ${appsPath}`);
  }

  // 4. Safe Deletion
  const eventIds = oldEvents.map(e => e.id);
  const staffingReqIds = oldEvents.flatMap(e => e.staffingRequests.map(r => r.id));
  const applicationIds = oldEvents.flatMap(e => e.staffingRequests.flatMap(r => r.applications.map(a => a.id)));
  const dispatchIds = oldEvents.flatMap(e => e.runnerDispatches.map(d => d.id));

  console.log("Starting deletion process...");

  // We must delete in reverse relational order to satisfy foreign key constraints:
  
  // A. Delete Payment Transactions linked to these applications
  const { count: deletedPayments } = await prisma.paymentTransaction.deleteMany({
    where: { applicationId: { in: applicationIds } }
  });
  console.log(`Deleted ${deletedPayments} PaymentTransactions.`);

  // B. Delete Applications
  const { count: deletedApps } = await prisma.application.deleteMany({
    where: { id: { in: applicationIds } }
  });
  console.log(`Deleted ${deletedApps} Applications.`);

  // C. Delete Staffing Requests
  const { count: deletedReqs } = await prisma.staffingRequest.deleteMany({
    where: { id: { in: staffingReqIds } }
  });
  console.log(`Deleted ${deletedReqs} StaffingRequests.`);

  // D. Delete Runner Dispatches
  const { count: deletedDispatches } = await prisma.runnerDispatch.deleteMany({
    where: { id: { in: dispatchIds } }
  });
  console.log(`Deleted ${deletedDispatches} RunnerDispatches.`);

  // F. Delete Event Chat Messages
  const { count: deletedChats } = await prisma.eventChatMessage.deleteMany({
    where: { eventId: { in: eventIds } }
  });
  console.log(`Deleted ${deletedChats} EventChatMessages.`);

  // G. Finally, Delete the Events
  const { count: deletedEvents } = await prisma.event.deleteMany({
    where: { id: { in: eventIds } }
  });
  console.log(`Deleted ${deletedEvents} Events.`);

  console.log("🎉 Archiving process complete!");
}

main()
  .catch(e => {
    console.error("Archive Failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
