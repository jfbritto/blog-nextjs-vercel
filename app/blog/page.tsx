import type { Metadata } from "next";

// Força SSR: esta página consulta o banco, não pode ser pré-renderizada no build
export const dynamic = "force-dynamic";
import { getAllPosts } from "@/lib/posts";
import PostCard from "@/components/PostCard";

export const metadata: Metadata = {
  title: "Posts",
  description: "Todos os posts do blog sobre desenvolvimento web com Next.js e React.",
};

export default async function BlogPage() {
  const posts = await getAllPosts();

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Posts</h1>
      <div className="flex flex-col gap-4">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
}
