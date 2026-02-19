import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminHeader from '@/components/admin/AdminHeader'

export const metadata = {
  title: 'Admin | Meu Blog',
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session) redirect('/login')

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader userEmail={session.user?.email} />
      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
