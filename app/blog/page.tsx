import type { Metadata } from "next";
import Link from "next/link";

// Força SSR: esta página consulta o banco, não pode ser pré-renderizada no build
export const dynamic = "force-dynamic";
import { getAllPosts } from "@/lib/posts";
import PostCard from "@/components/PostCard";

export const metadata: Metadata = {
  title: "Posts",
  description: "Todos os posts do blog sobre desenvolvimento web com Next.js e React.",
};

type Props = {
  searchParams: Promise<{ tag?: string }>;
};

export default async function BlogPage({ searchParams }: Props) {
  const { tag } = await searchParams;
  const allPosts = await getAllPosts();

  const posts = tag
    ? allPosts.filter((p) =>
        p.tags.some((t) => t.toLowerCase() === tag.toLowerCase())
      )
    : allPosts;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-black text-slate-900 border-l-4 border-[#dc2626] pl-4 leading-tight">
          {tag ? tag : "Posts"}
        </h1>
        <p className="text-sm text-slate-500 mt-2 pl-4">
          {posts.length} {posts.length === 1 ? "post publicado" : "posts publicados"}
          {tag && (
            <>
              {" "}
              <Link href="/blog" className="text-[#1a56db] hover:underline underline-offset-4">
                Ver todos →
              </Link>
            </>
          )}
        </p>
      </div>

      {posts.length === 0 ? (
        <p className="text-slate-500 text-sm pl-4">
          Nenhum post encontrado com a tag <strong>{tag}</strong>.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
