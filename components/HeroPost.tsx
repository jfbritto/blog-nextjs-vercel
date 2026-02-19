import Link from "next/link";
import type { PostMeta } from "@/lib/posts";

type HeroPostProps = {
  post: PostMeta;
};

function formatDate(dateString: string): string {
  return new Date(dateString + "T00:00:00").toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function HeroPost({ post }: HeroPostProps) {
  const firstTag = post.tags[0];

  return (
    <article className="group bg-slate-50 border-l-4 border-[#dc2626] rounded-r-xl p-8 sm:p-10 hover:bg-slate-100 transition-colors">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          {firstTag && (
            <span className="bg-[#dc2626] text-white text-[11px] font-bold tracking-widest uppercase px-2.5 py-1 rounded">
              {firstTag}
            </span>
          )}
          <span className="text-xs text-slate-500 font-medium">Destaque</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
          <Link
            href={`/blog/${post.slug}`}
            className="hover:text-[#dc2626] transition-colors"
          >
            {post.title}
          </Link>
        </h2>

        <p className="text-slate-600 text-lg leading-relaxed max-w-2xl">
          {post.description}
        </p>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            <span>·</span>
            <span>{post.readingTime} min de leitura</span>
          </div>
          <Link
            href={`/blog/${post.slug}`}
            className="text-sm font-semibold text-[#1a56db] hover:text-[#1e40af] underline-offset-4 hover:underline transition-colors"
          >
            Ler artigo →
          </Link>
        </div>
      </div>
    </article>
  );
}
