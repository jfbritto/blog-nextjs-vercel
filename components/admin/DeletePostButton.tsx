'use client'

import { deletePost } from '@/actions/posts'

type Props = {
  id: string
  title: string
}

export default function DeletePostButton({ id, title }: Props) {
  async function handleDelete() {
    if (!confirm(`Deletar "${title}"?`)) return
    await deletePost(id)
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      className="text-red-500 hover:text-red-700 transition-colors"
    >
      Deletar
    </button>
  )
}
