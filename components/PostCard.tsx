import Link from "next/link";
import type { PostMeta } from "@/lib/posts";

type PostCardProps = {
  post: PostMeta;
};

function formatDate(dateString: string): string {
  return new Date(dateString + "T00:00:00").toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function PostCard({ post }: PostCardProps) {
  const firstTag = post.tags[0];

  return (
    <article className="group p-5 border-b border-slate-100 hover:-translate-y-0.5 transition-transform duration-200">
      <div className="flex items-center gap-2 mb-2">
        {firstTag && (
          <span className="bg-[#fef2f2] text-[#dc2626] text-[11px] font-bold tracking-widest uppercase px-2 py-0.5 rounded">
            {firstTag}
          </span>
        )}
        <span className="text-xs text-slate-400">·</span>
        <time className="text-xs text-slate-400" dateTime={post.date}>
          {formatDate(post.date)}
        </time>
        <span className="text-xs text-slate-400">·</span>
        <span className="text-xs text-slate-400">{post.readingTime} min</span>
      </div>

      <h2 className="text-lg font-bold text-slate-900 leading-snug mb-1.5 group-hover:text-[#1a56db] transition-colors">
        <Link href={`/blog/${post.slug}`} className="hover:underline underline-offset-4">
          {post.title}
        </Link>
      </h2>

      <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 mb-3">
        {post.description}
      </p>

      <Link
        href={`/blog/${post.slug}`}
        className="text-xs font-semibold text-[#1a56db] hover:text-[#1e40af] hover:underline underline-offset-4 transition-colors"
      >
        Ler mais →
      </Link>
    </article>
  );
}
