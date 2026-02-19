import { prisma } from '@/lib/db'

export type PostMeta = {
  slug: string
  title: string
  date: string
  description: string
  tags: string[]
  readingTime: number
}

export type Post = PostMeta & {
  id: string
  content: string
  published: boolean
}

// Retorna todos os posts publicados, do mais recente ao mais antigo
export async function getAllPosts(): Promise<PostMeta[]> {
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
    select: {
      slug: true,
      title: true,
      description: true,
      tags: true,
      createdAt: true,
      content: true,
    },
  })

  return posts.map((p) => ({
    slug: p.slug,
    title: p.title,
    description: p.description,
    tags: p.tags,
    date: p.createdAt.toISOString().split('T')[0],
    readingTime: Math.ceil(p.content.split(' ').length / 200) || 1,
  }))
}

// Retorna um post publicado pelo slug — null se não existir
export async function getPostBySlug(slug: string): Promise<Post | null> {
  const post = await prisma.post.findUnique({
    where: { slug, published: true },
  })

  if (!post) return null

  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    description: post.description,
    tags: post.tags,
    date: post.createdAt.toISOString().split('T')[0],
    readingTime: Math.ceil(post.content.split(' ').length / 200) || 1,
    content: post.content,
    published: post.published,
  }
}

// Para o admin — retorna qualquer post (publicado ou não) pelo id
export async function getPostById(id: string): Promise<Post | null> {
  const post = await prisma.post.findUnique({ where: { id } })

  if (!post) return null

  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    description: post.description,
    tags: post.tags,
    date: post.createdAt.toISOString().split('T')[0],
    readingTime: Math.ceil(post.content.split(' ').length / 200) || 1,
    content: post.content,
    published: post.published,
  }
}
