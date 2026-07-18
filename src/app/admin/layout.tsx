import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import AdminLayoutClient from './layout-client';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('adminUserId')?.value || cookieStore.get('userId')?.value;

  if (!userId) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  
  if (!user || user.role !== 'ADMIN') {
    // If they are not an admin, boot them back to their respective dashboards
    if (user?.role === 'MANAGER') redirect('/manager');
    if (user?.role === 'WORKER') redirect('/worker');
    redirect('/login');
  }

  return <AdminLayoutClient user={user}>{children}</AdminLayoutClient>;
}
