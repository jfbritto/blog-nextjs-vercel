'use server'

import { signIn, signOut } from '@/lib/auth'
import { AuthError } from 'next-auth'

export async function loginAction(
  _prevState: { error?: string } | undefined,
  formData: FormData
): Promise<{ error: string } | undefined> {
  try {
    await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      redirectTo: '/admin/posts',
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: 'Email ou senha inválidos.' }
    }
    // Rethrow: o next-auth usa exceções para redirecionar
    throw error
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: '/login' })
}
