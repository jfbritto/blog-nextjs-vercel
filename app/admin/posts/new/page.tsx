import PostForm from '@/components/admin/PostForm'
import { createPost } from '@/actions/posts'

export default function NewPostPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Novo Post</h1>
      <PostForm action={createPost} />
    </div>
  )
}
