import AdminLayoutClient from './layout-client';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // Authentication is handled client-side in AdminLayoutClient for static export compatibility
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
