import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-gray-200">
      <nav className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
          Meu Blog
        </Link>
        <ul className="flex gap-6 list-none">
          <li>
            <Link href="/blog" className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium">
              Posts
            </Link>
          </li>
          <li>
            <Link href="/sobre" className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium">
              Sobre
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
