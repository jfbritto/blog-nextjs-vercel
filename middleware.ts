import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth.config'

// Cria uma instância do Auth.js APENAS com authConfig (sem Prisma/bcrypt).
// Isso é obrigatório porque o middleware roda no Edge Runtime,
// que não suporta módulos Node.js como 'crypto', 'pg' e 'bcryptjs'.
const { auth } = NextAuth(authConfig)

export default auth

export const config = {
  // Protege todas as rotas /admin/*
  matcher: ['/admin/:path*'],
}
