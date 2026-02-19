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
  return (
    <article className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
      <time className="text-sm text-gray-500" dateTime={post.date}>
        {formatDate(post.date)}
      </time>
      <h2 className="text-xl font-semibold mt-1 mb-2">
        <Link href={`/blog/${post.slug}`} className="hover:text-blue-600 transition-colors">
          {post.title}
        </Link>
      </h2>
      <p className="text-gray-600 text-sm leading-relaxed">{post.description}</p>
      {post.tags.length > 0 && (
        <div className="mt-4 flex gap-2 flex-wrap">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
