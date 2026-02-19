import { defineConfig } from 'prisma/config'
import path from 'path'
import { config as loadEnv } from 'dotenv'

// O Prisma CLI lê .env por padrão, mas não .env.local (que é carregado pelo Next.js).
// Carregamos explicitamente o .env.local para que DATABASE_URL fique disponível.
loadEnv({ path: path.resolve(process.cwd(), '.env.local') })

export default defineConfig({
  migrations: {
    // Prisma v7: seed é configurado aqui, não no package.json
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
})
