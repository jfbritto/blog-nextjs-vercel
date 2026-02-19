import Link from "next/link";

// Força SSR: esta página consulta o banco, não pode ser pré-renderizada no build
export const dynamic = "force-dynamic";
import { getAllPosts } from "@/lib/posts";
import PostCard from "@/components/PostCard";

export default async function Home() {
  const posts = (await getAllPosts()).slice(0, 3);

  return (
    <div>
      <section className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Olá, bem-vindo ao blog!
        </h1>
        <p className="text-lg text-gray-600 leading-relaxed">
          Aqui você encontra conteúdo sobre desenvolvimento web moderno: Next.js,
          React, SEO, performance e muito mais.
        </p>
      </section>

      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Posts Recentes</h2>
          <Link
            href="/blog"
            className="text-sm text-blue-600 hover:underline font-medium"
          >
            Ver todos →
          </Link>
        </div>
        <div className="flex flex-col gap-4">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      </section>
    </div>
  );
}
