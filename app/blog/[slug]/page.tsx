import type { Metadata } from "next";

// Força SSR: esta página consulta o banco, não pode ser pré-renderizada no build
export const dynamic = "force-dynamic";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getPostBySlug } from "@/lib/posts";

type PageProps = {
  params: Promise<{ slug: string }>;
};

// Gera os metadados SEO dinâmicos por post
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) return { title: "Post não encontrado" };

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

function formatDate(dateString: string): string {
  return new Date(dateString + "T00:00:00").toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) notFound();

  const readingTime = Math.ceil(post.content.split(" ").length / 200) || 1;
  const firstTag = post.tags[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="mb-8">
        <Link
          href="/blog"
          className="text-sm font-semibold text-[#1a56db] hover:text-[#1e40af] hover:underline underline-offset-4 transition-colors"
        >
          ← Voltar ao blog
        </Link>
      </nav>

      <article className="max-w-3xl">
        <header className="mb-10 pb-8 border-b border-slate-200">
          {firstTag && (
            <span className="inline-block bg-[#dc2626] text-white text-[11px] font-bold tracking-widest uppercase px-2.5 py-1 rounded mb-4">
              {firstTag}
            </span>
          )}
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight mt-2 mb-4">
            {post.title}
          </h1>
          <p className="text-slate-500 text-lg leading-relaxed mb-4">{post.description}</p>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            <span>·</span>
            <span>{readingTime} min de leitura</span>
          </div>
          {post.tags.length > 1 && (
            <div className="mt-4 flex gap-2 flex-wrap">
              {post.tags.slice(1).map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </header>

        <div className="prose prose-lg prose-slate max-w-none">
          <MDXRemote source={post.content} />
        </div>
      </article>
    </div>
  );
}
