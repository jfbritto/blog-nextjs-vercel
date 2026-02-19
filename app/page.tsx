import Link from "next/link";

// Força SSR: esta página consulta o banco, não pode ser pré-renderizada no build
export const dynamic = "force-dynamic";
import { getAllPosts } from "@/lib/posts";
import PostCard from "@/components/PostCard";
import HeroPost from "@/components/HeroPost";

export default async function Home() {
  const allPosts = await getAllPosts();
  const [heroPost, ...remainingPosts] = allPosts.slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-black text-slate-900 border-l-4 border-[#dc2626] pl-3">
          Posts Recentes
        </h2>
        <Link
          href="/blog"
          className="text-sm font-semibold text-[#1a56db] hover:text-[#1e40af] hover:underline underline-offset-4 transition-colors"
        >
          Ver todos →
        </Link>
      </div>

      {heroPost && (
        <div className="mb-8">
          <HeroPost post={heroPost} />
        </div>
      )}

      {remainingPosts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
          {remainingPosts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
