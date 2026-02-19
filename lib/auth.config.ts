import type { NextAuthConfig } from 'next-auth'

// Config leve: sem Prisma, sem bcrypt — compatível com Edge Runtime.
// Usada apenas pelo middleware para verificar se há sessão JWT válida.
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request }) {
      const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')
      return isAdminRoute ? !!auth?.user : true
    },
  },
  providers: [], // providers reais ficam em lib/auth.ts
  session: { strategy: 'jwt' },
}
