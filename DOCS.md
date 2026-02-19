# Documentação — Blog Next.js

Este documento explica cada decisão técnica do projeto, como ele funciona internamente, e o caminho completo do desenvolvimento ao deploy em produção.

---

## Índice

1. [Visão geral da stack](#1-visão-geral-da-stack)
2. [Estrutura de pastas](#2-estrutura-de-pastas)
3. [App Router vs Pages Router](#3-app-router-vs-pages-router)
4. [Como os posts funcionam (MDX + gray-matter)](#4-como-os-posts-funcionam-mdx--gray-matter)
5. [Static Site Generation (SSG)](#5-static-site-generation-ssg)
6. [SEO com a Metadata API](#6-seo-com-a-metadata-api)
7. [Tailwind CSS v4](#7-tailwind-css-v4)
8. [Como adicionar um novo post](#8-como-adicionar-um-novo-post)
9. [Rodando localmente](#9-rodando-localmente)
10. [Deploy na Vercel](#10-deploy-na-vercel)
11. [Próximos passos: migração do WordPress](#11-próximos-passos-migração-do-wordpress)

---

## 1. Visão geral da stack

| Tecnologia | Versão | Para que serve |
|---|---|---|
| Next.js | 16 | Framework React com SSR/SSG, roteamento, otimizações |
| React | 19 | Biblioteca de UI |
| TypeScript | 5 | Tipo-segurança no código |
| Tailwind CSS | 4 | Utilitários de CSS — estilo rápido sem CSS custom |
| gray-matter | 4 | Lê o frontmatter YAML dos arquivos `.mdx` |
| next-mdx-remote | 6 | Renderiza MDX no servidor (React Server Components) |
| @tailwindcss/typography | — | Estilos prontos para conteúdo Markdown/MDX |
| Vercel | — | Plataforma de deploy com CDN global |

---

## 2. Estrutura de pastas

```
site-nextjs/
├── app/                    ← Pasta principal do App Router
│   ├── layout.tsx          ← Layout raiz: HTML, fonte, Header, Footer
│   ├── page.tsx            ← Página home (/)
│   ├── globals.css         ← CSS global + Tailwind
│   ├── blog/
│   │   ├── page.tsx        ← Listagem de posts (/blog)
│   │   └── [slug]/
│   │       └── page.tsx    ← Post individual (/blog/meu-post)
│   └── sobre/
│       └── page.tsx        ← Página sobre (/sobre)
│
├── components/             ← Componentes reutilizáveis
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── PostCard.tsx
│
├── content/
│   └── posts/              ← Arquivos .mdx dos posts
│       ├── introducao-ao-nextjs.mdx
│       ├── seo-com-nextjs.mdx
│       └── deploy-na-vercel.mdx
│
├── lib/
│   └── posts.ts            ← Funções de leitura e parsing dos posts
│
├── public/                 ← Arquivos estáticos (imagens, favicon)
├── next.config.ts          ← Configuração do Next.js
├── tsconfig.json           ← Configuração do TypeScript
└── DOCS.md                 ← Este arquivo
```

---

## 3. App Router vs Pages Router

O Next.js tem dois sistemas de roteamento:

### Pages Router (legado)
- Pasta `pages/`
- Padrão até o Next.js 12
- `getStaticProps`, `getServerSideProps` como funções especiais
- Ainda suportado, mas não é o padrão recomendado

### App Router (atual)
- Pasta `app/`
- Padrão desde o Next.js 13
- Usa **React Server Components** por padrão
- Fetch de dados direto nos componentes (sem `getStaticProps`)
- Melhor performance: menos JS enviado ao cliente

**Por que escolhemos o App Router:**
- É o futuro do Next.js
- Melhor para SEO (HTML completo no servidor)
- Mais simples para layouts aninhados
- `generateMetadata` é mais poderoso que o antigo `Head`

---

## 4. Como os posts funcionam (MDX + gray-matter)

### Estrutura de um post

Cada post é um arquivo `.mdx` em `content/posts/`. O arquivo tem duas partes:

```mdx
---
title: "Título do Post"
date: "2025-01-20"
description: "Resumo para SEO (150-160 caracteres)"
tags: ["tag1", "tag2"]
---

## Conteúdo em Markdown aqui

Texto com **negrito**, _itálico_, [links](#), etc.
```

A parte entre `---` é o **frontmatter** (metadados em YAML).
O restante é o **conteúdo** em Markdown/MDX.

### Como o código lê os posts

**`lib/posts.ts`** contém duas funções principais:

```typescript
// Retorna todos os posts ordenados por data (mais recente primeiro)
getAllPosts(): PostMeta[]

// Retorna um post específico pelo slug (nome do arquivo sem .mdx)
getPostBySlug(slug: string): Post
```

O processo interno:
1. `fs.readdirSync()` lista os arquivos em `content/posts/`
2. Para cada arquivo, `fs.readFileSync()` lê o conteúdo
3. `matter(fileContents)` separa o frontmatter do conteúdo
4. A função retorna os dados tipados

### O que é MDX?

MDX = Markdown + JSX. Você pode usar componentes React dentro do Markdown:

```mdx
# Meu post

Texto normal em markdown.

<MeuComponente prop="valor" />
```

No nosso blog, os posts usam Markdown simples (sem JSX), mas MDX deixa a porta aberta para isso.

---

## 5. Static Site Generation (SSG)

SSG significa que as páginas são geradas como HTML estático durante o **build**, não a cada requisição.

### Como funciona em `app/blog/[slug]/page.tsx`

```typescript
// Esta função diz ao Next.js quais slugs existem
export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}
```

No build, o Next.js:
1. Chama `generateStaticParams()` → obtém `['introducao-ao-nextjs', 'seo-com-nextjs', ...]`
2. Para cada slug, renderiza a página e salva como HTML
3. O resultado é um arquivo HTML estático por post

### Por que SSG é importante?

| | SSG | SSR (Server-Side Rendering) |
|---|---|---|
| Velocidade | Ultra-rápido (arquivo estático) | Lento (processa a cada request) |
| SEO | Perfeito | Bom |
| Custo | Baixo (CDN) | Alto (servidor sempre ligado) |
| Ideal para | Blogs, portfólios, marketing | Dashboards, dados em tempo real |

Para um blog, SSG é a escolha certa: o conteúdo não muda a cada segundo.

---

## 6. SEO com a Metadata API

O Next.js 13+ tem uma API nativa para metadados SEO que substitui o antigo `<Head>`.

### Metadados estáticos (páginas fixas)

```typescript
// app/blog/page.tsx
export const metadata: Metadata = {
  title: "Posts",
  description: "Todos os posts do blog.",
};
```

Isso gera no HTML:
```html
<title>Posts | Meu Blog</title>
<meta name="description" content="Todos os posts do blog." />
```

### Metadados dinâmicos (páginas de post)

```typescript
// app/blog/[slug]/page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
    },
  };
}
```

### Template de título

No `layout.tsx` raiz:
```typescript
title: {
  default: "Meu Blog",       // Quando a página não define título
  template: "%s | Meu Blog", // Padrão: "Posts | Meu Blog"
}
```

### Open Graph

Controla como o link aparece no WhatsApp, Facebook, Twitter:
```typescript
openGraph: {
  title: "...",
  description: "...",
  type: "article",
  publishedTime: "2025-01-20",
}
```

---

## 7. Tailwind CSS v4

O Tailwind v4 tem uma configuração diferente das versões anteriores:

### Configuração no CSS (não no `tailwind.config.js`)

```css
/* app/globals.css */
@import "tailwindcss";
@plugin "@tailwindcss/typography";
```

Não existe mais o arquivo `tailwind.config.js` por padrão no v4. As configurações são feitas via CSS.

### Plugin Typography

O plugin `@tailwindcss/typography` fornece a classe `prose` para estilizar conteúdo HTML/Markdown de forma bonita:

```html
<div class="prose prose-gray max-w-none">
  <!-- Conteúdo MDX renderizado aqui -->
</div>
```

Isso aplica estilos automáticos para `<h1>`, `<h2>`, `<p>`, `<code>`, `<ul>`, etc.

---

## 8. Como adicionar um novo post

1. Crie um arquivo `.mdx` em `content/posts/`:

```bash
# Exemplo: content/posts/meu-novo-post.mdx
```

2. Adicione o frontmatter no início do arquivo:

```mdx
---
title: "Título do Novo Post"
date: "2025-03-01"
description: "Descrição curta e objetiva para SEO (máximo 160 caracteres)"
tags: ["nextjs", "tutorial"]
---

## Início do conteúdo

Seu texto aqui em Markdown...
```

3. Execute `npm run dev` ou `npm run build` — a rota `/blog/meu-novo-post` é gerada automaticamente.

**Regras para o nome do arquivo (slug):**
- Use apenas letras minúsculas, números e hífens
- Sem espaços, sem acentos
- O nome do arquivo vira a URL: `meu-novo-post.mdx` → `/blog/meu-novo-post`

---

## 9. Rodando localmente

```bash
# Instalar dependências (apenas na primeira vez)
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

Acesse `http://localhost:3000`

```bash
# Build de produção (testa se tudo vai funcionar na Vercel)
npm run build

# Iniciar servidor de produção local
npm run start
```

---

## 10. Deploy na Vercel

### Primeira vez

1. Faça push do código para o GitHub:
```bash
git add .
git commit -m "feat: blog inicial"
git push origin main
```

2. Acesse [vercel.com](https://vercel.com) e faça login com GitHub

3. Clique em **Add New → Project**

4. Selecione o repositório e clique em **Deploy**

5. Aguarde ~2 minutos — seu site estará no ar em uma URL `*.vercel.app`

### Deploys seguintes (automático)

```bash
git add .
git commit -m "feat: novo post sobre X"
git push origin main
# → A Vercel detecta o push e faz o deploy automaticamente
```

### Variáveis de ambiente

Se precisar de variáveis de ambiente (ex: API keys):
1. Crie o arquivo `.env.local` localmente (nunca commite este arquivo!)
2. Na Vercel: **Project Settings → Environment Variables** → adicione as variáveis

---

## 11. Próximos passos: migração do WordPress

Este projeto serve como base para migrar um site WordPress real. Os principais passos seriam:

### Exportar conteúdo do WordPress

O WordPress exporta conteúdo em XML via **Ferramentas → Exportar**. Você pode usar scripts para converter esse XML em arquivos `.mdx`.

### Alternativas para gerenciar conteúdo

Em vez de arquivos `.mdx` no repositório, você pode conectar o Next.js a um **Headless CMS**:

| CMS | Descrição |
|---|---|
| Contentful | CMS visual, plano gratuito generoso |
| Sanity | Flexível, com editor customizável |
| Strapi | Open source, self-hosted |
| WordPress (Headless) | Usa o WP como backend via REST API ou GraphQL |

### WordPress Headless

É possível manter o WordPress como editor de conteúdo e usar o Next.js apenas para o frontend:

```typescript
// Busca posts via API REST do WordPress
const res = await fetch('https://seusite.com/wp-json/wp/v2/posts')
const posts = await res.json()
```

Isso permite migração gradual: o editor continua no WordPress, mas o site serve Next.js.

---

## Resumo do fluxo completo

```
Escrever post (.mdx)
  → git push
    → Vercel detecta
      → npm run build
        → generateStaticParams() gera rotas
          → HTML estático gerado
            → CDN distribui globalmente
              → Usuário acessa o site ultra-rápido
```
