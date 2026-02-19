'use server'

import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const PostSchema = z.object({
  title: z.string().min(1, 'Título obrigatório').max(200),
  slug: z
    .string()
    .min(1, 'Slug obrigatório')
    .regex(/^[a-z0-9-]+$/, 'Slug: apenas letras minúsculas, números e hífens'),
  description: z.string().min(1, 'Descrição obrigatória').max(300),
  content: z.string().min(1, 'Conteúdo obrigatório'),
  tags: z.string().optional(),
  published: z.string().optional(),
})

type FormState = { errors?: Record<string, string[]> } | undefined

async function requireAuth() {
  const session = await auth()
  if (!session) redirect('/login')
}

function revalidateAll(slug?: string) {
  revalidatePath('/')
  revalidatePath('/blog')
  if (slug) revalidatePath(`/blog/${slug}`)
  revalidatePath('/admin/posts')
}

export async function createPost(_prevState: FormState, formData: FormData): Promise<FormState> {
  await requireAuth()

  const raw = Object.fromEntries(formData)
  const parsed = PostSchema.safeParse(raw)

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  const { title, slug, description, content, tags, published } = parsed.data

  await prisma.post.create({
    data: {
      title,
      slug,
      description,
      content,
      tags: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      published: published === 'on',
    },
  })

  revalidateAll(slug)
  redirect('/admin/posts')
}

export async function updatePost(
  id: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAuth()

  const raw = Object.fromEntries(formData)
  const parsed = PostSchema.safeParse(raw)

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  const { title, slug, description, content, tags, published } = parsed.data

  await prisma.post.update({
    where: { id },
    data: {
      title,
      slug,
      description,
      content,
      tags: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      published: published === 'on',
    },
  })

  revalidateAll(slug)
  redirect('/admin/posts')
}

export async function deletePost(id: string) {
  await requireAuth()

  const post = await prisma.post.delete({ where: { id } })

  revalidateAll(post.slug)
  redirect('/admin/posts')
}

export async function togglePublished(id: string, currentValue: boolean) {
  await requireAuth()

  const post = await prisma.post.update({
    where: { id },
    data: { published: !currentValue },
  })

  revalidateAll(post.slug)
}
