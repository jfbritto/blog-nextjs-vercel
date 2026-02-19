import Link from "next/link";
import Image from "next/image";

const topics = ["Next.js", "React", "Performance", "SEO", "TypeScript"];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      {/* Barra principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between h-14">
          <Link href="/">
            <Image src="/logo.png" alt="IJR." width={140} height={36} className="object-contain" />
          </Link>
          <ul className="flex gap-6 list-none">
            <li>
              <Link
                href="/blog"
                className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
              >
                Posts
              </Link>
            </li>
            <li>
              <Link
                href="/sobre"
                className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
              >
                Sobre
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Barra de tópicos */}
      <div className="bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6 h-8 overflow-x-auto no-scrollbar">
            {topics.map((topic) => (
              <Link
                key={topic}
                href={`/blog?tag=${encodeURIComponent(topic)}`}
                className="text-[11px] font-bold tracking-widest text-slate-400 hover:text-white transition-colors whitespace-nowrap uppercase"
              >
                {topic}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
