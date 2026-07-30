// ts-node script
import prisma from '../src/lib/prisma';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

async function deleteDemoAccounts() {
  const emailsToDelete = [
    'admin@backstage.com',
    'manager@backstage.com',
    'worker@backstage.com',
    'demomanager@backstage.com',
    'bangalore.worker1@test.com',
    'bangalore.worker2@test.com',
    'bangalore.worker3@test.com',
    'bangalore.worker4@test.com',
    'bangalore.worker5@test.com',
    'bangalore.worker6@test.com',
    'bangalore.worker7@test.com',
    'bangalore.worker8@test.com',
    'bangalore.worker9@test.com',
    'bangalore.worker10@test.com'
  ];

  console.log('Deleting demo accounts...');
  
  for (const email of emailsToDelete) {
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      
      if (user) {
        // Scramble password instead of deleting to avoid cascading deletion issues
        const randomPassword = crypto.randomBytes(32).toString('hex');
        const hashedPassword = await bcrypt.hash(randomPassword, 10);
        
        await prisma.user.update({
          where: { email },
          data: { password: hashedPassword }
        });
        console.log(`✅ Scrambled password for ${email}`);
      } else {
        console.log(`ℹ️ ${email} not found`);
      }
    } catch (error) {
      console.error(`❌ Error updating ${email}:`, error);
    }
  }
}

deleteDemoAccounts();
