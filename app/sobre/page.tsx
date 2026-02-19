import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sobre",
  description: "Saiba mais sobre este blog e a jornada de aprender Next.js antes de migrar um site WordPress.",
};

export default function SobrePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-black text-slate-900 border-l-4 border-[#dc2626] pl-4 leading-tight">
          Sobre
        </h1>
      </div>

      <div className="prose prose-lg prose-slate max-w-none">
          <p>
            Este blog foi criado como projeto de aprendizado para dominar a stack{" "}
            <strong>Next.js + Vercel</strong> antes de uma migração real de WordPress
            para uma aplicação moderna.
          </p>

          <h2>Por que Next.js?</h2>
          <p>
            O Next.js é o framework React mais usado em produção atualmente. Ele resolve
            problemas complexos de SEO, performance e deploy que o React puro não resolve
            sozinho.
          </p>

          <h2>O que você vai encontrar aqui</h2>
          <ul>
            <li>Desenvolvimento web moderno com React e Next.js</li>
            <li>SEO e boas práticas de performance</li>
            <li>Deploy e infraestrutura na Vercel</li>
            <li>Migração de conteúdo WordPress → Next.js</li>
          </ul>

          <h2>Stack utilizada</h2>
          <ul>
            <li><strong>Next.js 16</strong> com App Router</li>
            <li><strong>TypeScript</strong> para tipo-segurança</li>
            <li><strong>Tailwind CSS v4</strong> para estilo</li>
            <li><strong>Prisma + PostgreSQL</strong> para o banco de dados</li>
            <li><strong>Auth.js v5</strong> para autenticação</li>
            <li><strong>Vercel</strong> para deploy</li>
          </ul>

          <p>
            Quer ver o código em ação?{" "}
            <Link href="/blog" className="text-[#1a56db] hover:underline underline-offset-4">
              Leia os posts do blog →
            </Link>
          </p>
      </div>
    </div>
  );
}
