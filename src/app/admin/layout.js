import AdminSidebar from '@/components/admin/AdminSidebar'

export const metadata = {
  title: 'Administrare',
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-dvh flex-col bg-ivory lg:flex-row">
      <AdminSidebar />

      <main className="min-w-0 flex-1">{children}</main>
    </div>
  )
}
