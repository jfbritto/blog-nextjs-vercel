import { config as loadEnv } from 'dotenv'
import { resolve } from 'path'

// Carrega .env.local antes de qualquer outro import que use process.env
loadEnv({ path: resolve(process.cwd(), '.env.local') })

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

// Prisma v7: usa driver adapter
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL
  const adminPassword = process.env.SEED_ADMIN_PASSWORD

  if (!adminEmail || !adminPassword) {
    throw new Error('SEED_ADMIN_EMAIL e SEED_ADMIN_PASSWORD precisam estar definidos no .env.local')
  }

  // 1. Cria o usuário admin
  const hashedPassword = await bcrypt.hash(adminPassword, 12)
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: hashedPassword,
      name: 'Admin',
    },
  })
  console.log(`✓ Admin criado: ${adminEmail}`)

  // 2. Migra os posts MDX existentes para o banco
  const postsDir = path.join(process.cwd(), 'content/posts')

  if (!fs.existsSync(postsDir)) {
    console.log('ℹ Nenhum post MDX encontrado para migrar.')
    return
  }

  const files = fs.readdirSync(postsDir).filter((f) => f.endsWith('.mdx'))

  for (const file of files) {
    const slug = file.replace(/\.mdx$/, '')
    const raw = fs.readFileSync(path.join(postsDir, file), 'utf8')
    const { data, content } = matter(raw)

    await prisma.post.upsert({
      where: { slug },
      update: {},
      create: {
        slug,
        title: data.title as string,
        description: data.description as string,
        content,
        tags: (data.tags as string[]) ?? [],
        published: true,
      },
    })
    console.log(`✓ Post migrado: ${slug}`)
  }

  console.log('\n✅ Seed concluído com sucesso!')
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
