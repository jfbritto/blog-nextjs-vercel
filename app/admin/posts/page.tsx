import Link from 'next/link'
import { prisma } from '@/lib/db'
import { togglePublished } from '@/actions/posts'
import DeletePostButton from '@/components/admin/DeletePostButton'

export default async function AdminPostsPage() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      slug: true,
      published: true,
      createdAt: true,
    },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Posts</h1>
        <Link
          href="/admin/posts/new"
          className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + Novo Post
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">Nenhum post ainda.</p>
          <Link href="/admin/posts/new" className="text-blue-600 hover:underline text-sm mt-2 inline-block">
            Criar o primeiro post →
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Título</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600 hidden sm:table-cell">Data</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{post.title}</div>
                    <div className="text-gray-400 text-xs mt-0.5">/blog/{post.slug}</div>
                  </td>
                  <td className="px-4 py-3">
                    <form action={togglePublished.bind(null, post.id, post.published)}>
                      <button
                        type="submit"
                        className={`text-xs px-2 py-1 rounded-full font-medium transition-colors ${
                          post.published
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {post.published ? 'Publicado' : 'Rascunho'}
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">
                    {post.createdAt.toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-4">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        target="_blank"
                      >
                        Ver
                      </Link>
                      <Link
                        href={`/admin/posts/${post.id}/edit`}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        Editar
                      </Link>
                      <DeletePostButton id={post.id} title={post.title} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
