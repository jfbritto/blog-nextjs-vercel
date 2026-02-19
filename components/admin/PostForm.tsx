'use client'

import { useActionState } from 'react'
import type { Post } from '@/lib/posts'

type FormState = { errors?: Record<string, string[]> } | undefined

type Props = {
  post?: Post
  action: (prevState: FormState, formData: FormData) => Promise<FormState>
}

// Gera slug a partir do título removendo acentos, espaços e caracteres especiais
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export default function PostForm({ post, action }: Props) {
  const [state, formAction, isPending] = useActionState(action, undefined)

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {/* Título */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Título
        </label>
        <input
          id="title"
          type="text"
          name="title"
          defaultValue={post?.title}
          required
          maxLength={200}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={(e) => {
            // Auto-gera o slug apenas para posts novos
            if (!post) {
              const slugInput = document.querySelector<HTMLInputElement>('[name="slug"]')
              if (slugInput) slugInput.value = slugify(e.target.value)
            }
          }}
        />
        {state?.errors?.title && (
          <p className="text-red-600 text-xs mt-1">{state.errors.title[0]}</p>
        )}
      </div>

      {/* Slug */}
      <div>
        <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
          Slug <span className="text-gray-400 font-normal">(URL do post)</span>
        </label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">/blog/</span>
          <input
            id="slug"
            type="text"
            name="slug"
            defaultValue={post?.slug}
            required
            pattern="[a-z0-9-]+"
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {state?.errors?.slug && (
          <p className="text-red-600 text-xs mt-1">{state.errors.slug[0]}</p>
        )}
      </div>

      {/* Descrição */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Descrição <span className="text-gray-400 font-normal">(resumo para SEO, máx 300 chars)</span>
        </label>
        <input
          id="description"
          type="text"
          name="description"
          defaultValue={post?.description}
          required
          maxLength={300}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {state?.errors?.description && (
          <p className="text-red-600 text-xs mt-1">{state.errors.description[0]}</p>
        )}
      </div>

      {/* Tags */}
      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
          Tags <span className="text-gray-400 font-normal">(separadas por vírgula)</span>
        </label>
        <input
          id="tags"
          type="text"
          name="tags"
          defaultValue={post?.tags?.join(', ')}
          placeholder="nextjs, react, tutorial"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Conteúdo */}
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
          Conteúdo <span className="text-gray-400 font-normal">(Markdown)</span>
        </label>
        <textarea
          id="content"
          name="content"
          defaultValue={post?.content}
          required
          rows={22}
          placeholder={'## Título da seção\n\nEscreva o conteúdo em **Markdown**...\n\n- Item 1\n- Item 2'}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
        />
        {state?.errors?.content && (
          <p className="text-red-600 text-xs mt-1">{state.errors.content[0]}</p>
        )}
      </div>

      {/* Publicado */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          name="published"
          id="published"
          defaultChecked={post?.published ?? false}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="published" className="text-sm text-gray-700">
          Publicar post <span className="text-gray-400">(desmarcado = rascunho)</span>
        </label>
      </div>

      {/* Ações */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="bg-blue-600 text-white rounded-lg px-6 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {isPending ? 'Salvando...' : 'Salvar Post'}
        </button>
        <a
          href="/admin/posts"
          className="text-sm text-gray-600 hover:text-gray-900 py-2 px-4 border border-gray-300 rounded-lg transition-colors"
        >
          Cancelar
        </a>
      </div>
    </form>
  )
}
