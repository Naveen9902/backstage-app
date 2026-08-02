import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const pool = new Pool({ connectionString: 'postgresql://postgres.lwqvgugizktisutyzzxj:Naveen9902*1234@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres' });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const newAccount = await prisma.user.findUnique({ 
    where: { email: 'pagadekallnaveen@gmail.com' },
    include: { events: true } 
  });
  
  const oldAccount = await prisma.user.findUnique({ 
    where: { id: 'f919fc4f-2556-42db-aa8b-aec83fbebbcb' } 
  });

  if (newAccount && oldAccount) {
    if (newAccount.events.length === 0) {
      // 1. Delete new dummy account
      await prisma.user.delete({ where: { id: newAccount.id } });
      console.log('Deleted dummy account:', newAccount.id);
      
      // 2. Restore old account
      await prisma.user.update({
        where: { id: oldAccount.id },
        data: { email: 'pagadekallnaveen@gmail.com' }
      });
      console.log('Restored old account email to pagadekallnaveen@gmail.com');
    }
  } else {
    console.log('Accounts not found', { newAccount: !!newAccount, oldAccount: !!oldAccount });
  }
}

main().then(() => process.exit(0)).catch(e => console.error(e));
