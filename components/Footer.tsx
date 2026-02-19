export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 mt-auto">
      <div className="max-w-3xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
        <p>© {year} Meu Blog — Feito com Next.js e hospedado na Vercel.</p>
      </div>
    </footer>
  );
}
