import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-10">
          {/* Coluna 1: Marca */}
          <div>
            <Link href="/" className="text-xl font-black text-white hover:text-[#dc2626] transition-colors">
              Meu Blog
            </Link>
            <p className="mt-3 text-sm leading-relaxed">
              Conteúdo sobre desenvolvimento web moderno com Next.js, React e as melhores práticas de performance e SEO.
            </p>
          </div>

          {/* Coluna 2: Navegação */}
          <div>
            <h3 className="text-xs font-bold tracking-widest uppercase text-slate-300 mb-4">
              Navegação
            </h3>
            <ul className="flex flex-col gap-2 text-sm">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Início
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-white transition-colors">
                  Posts
                </Link>
              </li>
              <li>
                <Link href="/sobre" className="hover:text-white transition-colors">
                  Sobre
                </Link>
              </li>
            </ul>
          </div>

          {/* Coluna 3: Links externos */}
          <div>
            <h3 className="text-xs font-bold tracking-widest uppercase text-slate-300 mb-4">
              Links
            </h3>
            <ul className="flex flex-col gap-2 text-sm">
              <li>
                <a
                  href="https://nextjs.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Next.js
                </a>
              </li>
              <li>
                <a
                  href="https://vercel.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Vercel
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 text-xs text-center text-slate-600">
          © {year} Meu Blog — Feito com Next.js e hospedado na Vercel.
        </div>
      </div>
    </footer>
  );
}
