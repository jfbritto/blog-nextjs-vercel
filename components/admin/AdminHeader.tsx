import Link from 'next/link'
import { logoutAction } from '@/actions/auth'

type Props = {
  userEmail?: string | null
}

export default function AdminHeader({ userEmail }: Props) {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            ← Blog
          </Link>
          <Link
            href="/admin/posts"
            className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            Posts
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {userEmail && (
            <span className="text-sm text-gray-400 hidden sm:inline">{userEmail}</span>
          )}
          <form action={logoutAction}>
            <button
              type="submit"
              className="text-sm text-red-600 hover:text-red-800 font-medium transition-colors"
            >
              Sair
            </button>
          </form>
        </div>
      </div>
    </header>
  )
}
