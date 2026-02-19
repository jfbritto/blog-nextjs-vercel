import { notFound } from 'next/navigation'
import { getPostById } from '@/lib/posts'
import { updatePost } from '@/actions/posts'
import PostForm from '@/components/admin/PostForm'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function EditPostPage({ params }: PageProps) {
  const { id } = await params
  const post = await getPostById(id)

  if (!post) notFound()

  // Vincula o id do post ao updatePost para o formulário usar
  const updatePostWithId = updatePost.bind(null, id)

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Editar Post</h1>
      <PostForm post={post} action={updatePostWithId} />
    </div>
  )
}
