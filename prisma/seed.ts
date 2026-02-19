import { config as loadEnv } from 'dotenv'
import { resolve } from 'path'

// Carrega .env.local antes de qualquer outro import que use process.env
loadEnv({ path: resolve(process.cwd(), '.env.local') })

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

// Prisma v7: usa driver adapter
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const posts = [
  {
    slug: 'nextjs-app-router-guia-completo',
    title: 'Next.js App Router: o guia completo para 2025',
    description: 'Entenda de vez o App Router do Next.js — layouts aninhados, Server Components, Server Actions e tudo que mudou em relação ao Pages Router.',
    tags: ['Next.js', 'React', 'App Router'],
    published: true,
    content: `O **App Router** introduzido no Next.js 13 e consolidado nas versões seguintes representa a maior mudança de paradigma do framework desde sua criação. Se você ainda está preso no Pages Router ou sente que o App Router é confuso, este guia é para você.

## O que mudou de verdade

A diferença fundamental não é apenas estrutural — é conceitual. No Pages Router, todo componente era um Client Component por padrão. No App Router, todo componente é um **Server Component** por padrão.

Isso muda como você pensa sobre dados, estado e interatividade.

## Server Components vs Client Components

Server Components rodam exclusivamente no servidor. Eles podem:

- Acessar banco de dados diretamente
- Ler arquivos do sistema
- Usar variáveis de ambiente secretas
- Reduzir o JavaScript enviado ao cliente

\`\`\`tsx
// app/posts/page.tsx — Server Component por padrão
export default async function PostsPage() {
  // Acesso direto ao banco, sem API route
  const posts = await prisma.post.findMany()
  return <PostList posts={posts} />
}
\`\`\`

Client Components só devem ser usados quando você precisa de:

- Estado com \`useState\` ou \`useReducer\`
- Efeitos com \`useEffect\`
- Event handlers (onClick, onChange…)
- APIs do browser (localStorage, window…)

\`\`\`tsx
'use client'

import { useState } from 'react'

export function SearchInput() {
  const [query, setQuery] = useState('')
  return <input value={query} onChange={e => setQuery(e.target.value)} />
}
\`\`\`

## Layouts aninhados

O App Router usa a convenção de arquivos \`layout.tsx\` para criar layouts persistentes:

\`\`\`
app/
├── layout.tsx          ← layout raiz (HTML, body)
├── page.tsx            ← /
├── blog/
│   ├── layout.tsx      ← layout do blog (navbar do blog)
│   ├── page.tsx        ← /blog
│   └── [slug]/
│       └── page.tsx    ← /blog/:slug
\`\`\`

Cada layout envolve suas rotas filhas sem re-renderizar ao navegar. Isso dá performance de SPA com HTML semântico.

## Server Actions

Server Actions permitem mutações de dados sem criar API routes:

\`\`\`tsx
async function createPost(formData: FormData) {
  'use server'
  const title = formData.get('title') as string
  await prisma.post.create({ data: { title } })
  revalidatePath('/blog')
}

export default function NewPostForm() {
  return (
    <form action={createPost}>
      <input name="title" />
      <button type="submit">Criar</button>
    </form>
  )
}
\`\`\`

## Streaming e Suspense

Com o App Router você pode usar \`loading.tsx\` e \`<Suspense>\` para streaming de conteúdo:

\`\`\`tsx
import { Suspense } from 'react'

export default function Page() {
  return (
    <div>
      <h1>Posts</h1>
      <Suspense fallback={<PostsSkeleton />}>
        <PostList />
      </Suspense>
    </div>
  )
}
\`\`\`

## Conclusão

O App Router não é só uma mudança de convenção de arquivos. É uma mudança de mentalidade: pense primeiro em Server Components, adicione interatividade no cliente somente quando necessário. O resultado é aplicações mais rápidas, menos JavaScript no browser e código mais simples.`,
  },
  {
    slug: 'react-server-components-na-pratica',
    title: 'React Server Components na prática: quando usar e quando evitar',
    description: 'RSC é o futuro do React, mas usar errado gera bugs sutis. Aprenda os padrões corretos, as armadilhas comuns e como compor Server e Client Components.',
    tags: ['React', 'RSC', 'Performance'],
    published: true,
    content: `React Server Components (RSC) chegaram para ficar — e frameworks como Next.js já os usam por padrão. Mas entender *quando usar* e *quando evitar* é o que separa um código limpo de um cheio de \`"use client"\` desnecessários.

## O modelo mental correto

Pense assim: **o servidor renderiza, o cliente interage**. A regra de ouro é simples:

- Sem estado, sem eventos → Server Component
- Com estado ou eventos → Client Component

O problema é que muitos desenvolvedores chegam do React tradicional e adicionam \`"use client"\` em tudo por costume, anulando os benefícios dos RSC.

## O que você ganha com Server Components

### Zero bundle impact
Um Server Component não adiciona *nenhum* JavaScript ao bundle do cliente. Isso é especialmente valioso para componentes pesados — parsers de markdown, formatadores de data, componentes de visualização de dados.

\`\`\`tsx
// Este componente não envia NADA ao cliente
import { marked } from 'marked' // lib pesada, fica no servidor

export function MarkdownRenderer({ content }: { content: string }) {
  const html = marked(content)
  return <div dangerouslySetInnerHTML={{ __html: html }} />
}
\`\`\`

### Acesso direto a recursos do servidor

\`\`\`tsx
import { cookies } from 'next/headers'
import { db } from '@/lib/db'

export async function UserProfile() {
  const token = (await cookies()).get('token')
  const user = await db.user.findUnique({ where: { token } })
  return <div>{user?.name}</div>
}
\`\`\`

## O padrão de composição

Você pode aninhar Client Components dentro de Server Components — e vice-versa, com uma regra: **não passe funções de Server para Client como props**.

\`\`\`tsx
// ✅ Correto: Server Component passa dados serializáveis para Client
async function PostPage({ slug }: { slug: string }) {
  const post = await getPost(slug) // roda no servidor
  return <LikeButton postId={post.id} initialLikes={post.likes} />
}

// ❌ Errado: não passe callbacks de servidor para cliente
async function PostPage() {
  async function handleLike() { 'use server'; /* ... */ }
  return <LikeButton onLike={handleLike} /> // funções não são serializáveis
}
\`\`\`

## Padrão "pass children"

Uma técnica poderosa: o Client Component recebe \`children\` e renderiza Server Components dentro:

\`\`\`tsx
'use client'

export function Modal({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <button onClick={() => setOpen(true)}>Abrir</button>
      {open && <div className="modal">{children}</div>}
    </div>
  )
}

// No Server Component pai:
<Modal>
  <UserProfile /> {/* Server Component dentro de Client Component ✅ */}
</Modal>
\`\`\`

## Armadilhas comuns

### 1. Contexto não funciona em Server Components

\`useContext\` é Client-only. Para compartilhar dados entre Server Components, use props ou busque os dados em cada componente separadamente (o Next.js deduplica automaticamente via fetch caching).

### 2. "use client" propaga para baixo

Quando você marca um arquivo com \`"use client"\`, todos os imports desse arquivo também se tornam Client Components. Mantenha os Client Components pequenos e na folha da árvore.

### 3. Serialização de props

Props entre Server → Client devem ser serializáveis: strings, números, objetos simples, arrays. Não envie instâncias de classe, funções ou referências a módulos.

## Quando usar Client Components

- Formulários com validação em tempo real
- Componentes com animações baseadas em estado
- Integrações com APIs do browser (geolocalização, câmera)
- Bibliotecas de UI que dependem de hooks (Radix, Framer Motion)

## Conclusão

RSC não substitui Client Components — os dois coexistem. A heurística é simples: comece com Server Component e mova para Client só quando precisar de interatividade. Seu bundle size vai agradecer.`,
  },
  {
    slug: 'typescript-dicas-avancadas',
    title: 'TypeScript: 10 dicas avançadas que todo dev deveria saber',
    description: 'Vá além do básico: tipos utilitários, template literal types, discriminated unions e outros recursos do TypeScript que vão transformar como você escreve código.',
    tags: ['TypeScript', 'JavaScript'],
    published: true,
    content: `TypeScript tem uma curva de aprendizado curiosa: os 20% básicos cobrem 80% dos casos do dia a dia, mas os outros 80% do sistema de tipos escondem superpoderes que poucos desenvolvedores exploram. Estas são 10 dicas que vão mudar como você usa TypeScript.

## 1. Discriminated Unions para modelar estados

Em vez de flags booleanas soltas, use unions que garantem consistência:

\`\`\`ts
// ❌ Perigoso: estado incoerente é possível
type State = {
  loading: boolean
  data: User | null
  error: string | null
}

// ✅ Correto: cada estado tem exatamente os campos que precisa
type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: User }
  | { status: 'error'; error: string }
\`\`\`

## 2. Template Literal Types

Crie tipos a partir de strings:

\`\`\`ts
type Direction = 'top' | 'right' | 'bottom' | 'left'
type Margin = \`margin-\${Direction}\`
// 'margin-top' | 'margin-right' | 'margin-bottom' | 'margin-left'

type EventName = \`on\${Capitalize<string>}\`
// 'onClick', 'onChange', 'onSubmit'...
\`\`\`

## 3. Satisfies operator

\`satisfies\` valida o tipo sem perder informação de tipo específico:

\`\`\`ts
const palette = {
  red: [255, 0, 0],
  green: '#00ff00',
} satisfies Record<string, string | number[]>

// red é number[], não string | number[]
palette.red.map(v => v * 2) // ✅ funciona
\`\`\`

## 4. Tipos utilitários essenciais

\`\`\`ts
type User = { id: string; name: string; email: string; password: string }

type PublicUser = Omit<User, 'password'>
type PartialUser = Partial<User>
type RequiredUser = Required<PartialUser>
type ReadonlyUser = Readonly<User>
type UserKeys = keyof User // 'id' | 'name' | 'email' | 'password'
type UserValues = User[keyof User] // string
\`\`\`

## 5. Infer em tipos condicionais

Extraia tipos de dentro de outros tipos:

\`\`\`ts
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never
type Awaited<T> = T extends Promise<infer R> ? R : T

type ApiResponse = Awaited<ReturnType<typeof fetchUser>>
\`\`\`

## 6. Branded Types para segurança semântica

Evite confundir strings que têm significados diferentes:

\`\`\`ts
type UserId = string & { readonly brand: 'UserId' }
type PostId = string & { readonly brand: 'PostId' }

function createUserId(id: string): UserId {
  return id as UserId
}

function getUser(id: UserId) { /* ... */ }

const userId = createUserId('123')
const postId = '456' as PostId

getUser(userId) // ✅
getUser(postId) // ❌ Type Error!
\`\`\`

## 7. Const assertions

\`\`\`ts
const routes = ['/', '/blog', '/sobre'] as const
type Route = typeof routes[number] // '/' | '/blog' | '/sobre'

const config = {
  env: 'production',
  port: 3000,
} as const
// Todos os campos ficam readonly e com tipo literal
\`\`\`

## 8. Mapped Types

Transforme tipos programaticamente:

\`\`\`ts
type Nullable<T> = { [K in keyof T]: T[K] | null }
type Optional<T> = { [K in keyof T]?: T[K] }
type Getters<T> = { [K in keyof T as \`get\${Capitalize<string & K>}\`]: () => T[K] }

type UserGetters = Getters<User>
// { getId: () => string; getName: () => string; ... }
\`\`\`

## 9. never para exaustividade

\`\`\`ts
function assertNever(x: never): never {
  throw new Error('Caso não tratado: ' + x)
}

function handleStatus(status: 'ativo' | 'inativo' | 'pendente') {
  switch (status) {
    case 'ativo': return 'Usuário ativo'
    case 'inativo': return 'Usuário inativo'
    case 'pendente': return 'Aguardando aprovação'
    default: return assertNever(status) // erro de compilação se faltar um caso
  }
}
\`\`\`

## 10. Declaration merging para estender libs

\`\`\`ts
// Estender a sessão do NextAuth
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
    }
  }
}
\`\`\`

## Conclusão

O sistema de tipos do TypeScript é uma linguagem dentro de uma linguagem. Dominar esses recursos vai tornar seu código mais seguro, mais expressivo e mais fácil de refatorar — sem escrever nem uma linha de lógica extra em runtime.`,
  },
  {
    slug: 'css-grid-flexbox-quando-usar',
    title: 'CSS Grid vs Flexbox: a regra definitiva de quando usar cada um',
    description: 'A confusão entre Grid e Flexbox é real, mas existe uma regra simples: Grid é para layout, Flexbox é para alinhamento. Entenda de vez com exemplos práticos.',
    tags: ['CSS', 'Frontend', 'Design'],
    published: true,
    content: `Grid ou Flexbox? Essa pergunta aparece toda semana em fóruns de desenvolvimento. A verdade é que não são concorrentes — são ferramentas complementares com propósitos distintos. Existe uma regra simples que vai clarear tudo.

## A regra de ouro

**Flexbox** → uma dimensão (linha OU coluna)
**Grid** → duas dimensões (linhas E colunas)

Se você está alinhando itens em uma linha ou coluna: use Flexbox.
Se você está criando um layout de página com linhas e colunas: use Grid.

## Flexbox: o mestre do alinhamento

Flexbox brilha quando você quer distribuir espaço entre itens e alinhá-los:

\`\`\`css
/* Navbar: itens em linha com espaço entre eles */
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

/* Card: conteúdo empilhado verticalmente */
.card {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* Centralizar um elemento */
.container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}
\`\`\`

O poder do Flexbox está no \`flex-grow\`, \`flex-shrink\` e \`flex-basis\` — você define *como os itens crescem e encolhem* em relação ao espaço disponível.

## Grid: o arquiteto do layout

Grid é ideal quando você precisa que elementos se posicionem em relação a linhas E colunas simultaneamente:

\`\`\`css
/* Layout de página clássico */
.page {
  display: grid;
  grid-template-areas:
    'header header'
    'sidebar main'
    'footer footer';
  grid-template-columns: 250px 1fr;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
}

.header { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main { grid-area: main; }
.footer { grid-area: footer; }
\`\`\`

\`\`\`css
/* Grid responsivo sem media queries */
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}
\`\`\`

Esse último exemplo é um dos mais poderosos do CSS moderno: cria automaticamente quantas colunas couberem, cada uma com pelo menos 280px.

## Casos onde cada um ganha

### Use Flexbox para:
- Navbars e menus de navegação
- Grupos de botões ou badges
- Centralizar um único elemento
- Listas de itens que crescem/encolhem

### Use Grid para:
- Layout principal da página (header, sidebar, main, footer)
- Galerias de imagens
- Cards em grade responsiva
- Qualquer layout onde linhas e colunas precisam se alinhar entre si

## Combinando os dois

O segredo é combinar: Grid para a estrutura macro, Flexbox para os componentes internos.

\`\`\`css
/* Grid para a estrutura geral */
.page {
  display: grid;
  grid-template-columns: 1fr 3fr;
}

/* Flexbox dentro de cada seção */
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.main-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
\`\`\`

## A feature que todo dev esquece: subgrid

CSS Subgrid (suporte amplo desde 2023) resolve o problema de alinhar elementos de cards em grades:

\`\`\`css
.card-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.card {
  display: grid;
  grid-row: span 3;
  grid-template-rows: subgrid; /* usa as trilhas do pai */
}
\`\`\`

Agora os títulos, descrições e botões de todos os cards ficam alinhados automaticamente, mesmo com textos de tamanhos diferentes.

## Conclusão

Pare de pensar em Grid vs Flexbox como uma escolha. Pense em camadas: Grid para estrutura, Flexbox para alinhamento. Juntos eles cobrem 95% de qualquer layout que você precisar construir.`,
  },
  {
    slug: 'core-web-vitals-guia-pratico',
    title: 'Core Web Vitals: o guia prático para passar no PageSpeed',
    description: 'LCP, CLS e INP são as métricas que o Google usa para rankear seu site. Entenda o que cada uma mede e as técnicas específicas para melhorar cada pontuação.',
    tags: ['Performance', 'SEO', 'Web Vitals'],
    published: true,
    content: `Google usa Core Web Vitals como fator de ranking desde 2021. Se o seu site tem notas ruins no PageSpeed Insights, você está perdendo posições no Google — e usuários. Vamos destrinchar cada métrica e as soluções específicas para cada problema.

## As três métricas principais

### LCP — Largest Contentful Paint
**O que mede:** quanto tempo até o maior elemento visível (imagem, bloco de texto, vídeo) ser renderizado.
**Meta:** < 2.5 segundos

O LCP é geralmente uma imagem hero, um banner ou um bloco grande de texto. Para descobrir qual é o seu:

\`\`\`js
new PerformanceObserver((entryList) => {
  for (const entry of entryList.getEntries()) {
    console.log('LCP element:', entry.element)
  }
}).observe({ type: 'largest-contentful-paint', buffered: true })
\`\`\`

**Como melhorar:**
- Use \`priority\` em imagens acima do fold com Next.js Image
- Pré-conecte a origens externas: \`<link rel="preconnect" href="...">\`
- Sirva imagens em formato WebP/AVIF
- Use CDN para assets estáticos

\`\`\`tsx
// ✅ Imagem LCP com priority
<Image
  src="/hero.webp"
  alt="Hero"
  width={1200}
  height={600}
  priority // pré-carrega no head
/>
\`\`\`

### CLS — Cumulative Layout Shift
**O que mede:** o quanto os elementos da página se movem inesperadamente durante o carregamento.
**Meta:** < 0.1

CLS ruim é quando você vai clicar em um botão e um anúncio aparece e o botão se move. É a experiência mais frustrante de todas.

**Causas comuns:**
- Imagens sem dimensões definidas
- Anúncios ou embeds sem espaço reservado
- Fontes web causando FOUT (Flash of Unstyled Text)

**Como corrigir:**
\`\`\`html
<!-- Sempre defina width e height em imagens -->
<img src="foto.jpg" width="800" height="600" alt="...">

<!-- Reserve espaço para embeds -->
<div style="aspect-ratio: 16/9">
  <iframe src="..."></iframe>
</div>
\`\`\`

\`\`\`css
/* Evite FOUT com font-display */
@font-face {
  font-family: 'MinhaFonte';
  src: url('fonte.woff2');
  font-display: optional; /* não bloqueia renderização */
}
\`\`\`

### INP — Interaction to Next Paint
**O que mede:** latência das interações do usuário (cliques, toques, teclas).
**Meta:** < 200ms

INP substituiu FID em 2024 e é mais abrangente — mede *todas* as interações, não só a primeira.

**Como melhorar:**
- Quebre tarefas longas de JavaScript: use \`scheduler.yield()\` ou \`setTimeout\`
- Mova trabalho pesado para Web Workers
- Adie scripts não-críticos com \`defer\` ou \`async\`
- Use \`React.memo\` e \`useMemo\` para evitar re-renders desnecessários

\`\`\`js
// Quebre tarefas longas
async function processarLista(items) {
  for (const item of items) {
    processar(item)
    await scheduler.yield() // cede controle ao browser entre iterações
  }
}
\`\`\`

## Ferramentas de diagnóstico

**PageSpeed Insights** — analisa URLs reais com dados de campo (CrUX)
**Lighthouse** — análise sintética no DevTools (Cmd+Shift+P → Lighthouse)
**WebPageTest** — filmstripe visual do carregamento, múltiplas localizações
**Chrome DevTools Performance** — flamegraph detalhado de JavaScript

## Checklist rápido

- [ ] Imagens com \`width\` e \`height\` explícitos
- [ ] Imagem LCP com \`priority\` ou \`<link rel="preload">\`
- [ ] Fontes com \`font-display: swap\` ou \`optional\`
- [ ] Scripts de terceiros com \`async\` ou \`defer\`
- [ ] CSS crítico inline no \`<head>\`
- [ ] Compressão gzip/brotli no servidor
- [ ] Cache-Control configurado para assets estáticos

## Conclusão

Core Web Vitals não é só SEO — é experiência do usuário. Sites rápidos convertem mais, têm menor taxa de rejeição e rankeiam melhor. Comece pelo LCP (geralmente o maior impacto), resolva o CLS (mais fácil de corrigir), e por último otimize o INP (mais complexo).`,
  },
  {
    slug: 'tailwind-css-padroes-avancados',
    title: 'Tailwind CSS: padrões avançados para código limpo e reutilizável',
    description: 'Utility-first não significa CSS bagunçado. Aprenda a organizar componentes com Tailwind, criar variantes tipadas e evitar os erros mais comuns de quem começa.',
    tags: ['CSS', 'Tailwind', 'Frontend'],
    published: true,
    content: `Tailwind CSS divide opiniões. Quem nunca usou vê classes longas e pensa "que bagunça". Quem usa há um tempo sabe que com as práticas certas, o código fica mais manutenível do que CSS tradicional. O segredo está nos padrões.

## O erro mais comum: classes em linha sem estrutura

\`\`\`tsx
// ❌ Difícil de ler e manter
<button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg shadow-sm transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
  Enviar
</button>
\`\`\`

## Solução 1: extraia componentes

O Tailwind foi desenhado para trabalhar *com* componentização. Extraia o botão:

\`\`\`tsx
// ✅ Componente reutilizável
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger'
}

const variants = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white',
  secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
}

export function Button({ variant = 'primary', className, ...props }: ButtonProps) {
  return (
    <button
      className={\`\${variants[variant]} font-semibold px-4 py-2 rounded-lg transition-colors
        disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none
        focus:ring-2 focus:ring-offset-2 \${className ?? ''}\`}
      {...props}
    />
  )
}
\`\`\`

## Solução 2: cva para variantes tipadas

A biblioteca \`class-variance-authority\` (cva) é perfeita para componentes com variantes:

\`\`\`tsx
import { cva, type VariantProps } from 'class-variance-authority'

const button = cva(
  'font-semibold rounded-lg transition-colors disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-blue-600 hover:bg-blue-700 text-white',
        secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900',
        danger: 'bg-red-600 hover:bg-red-700 text-white',
      },
      size: {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof button>

export function Button({ variant, size, className, ...props }: ButtonProps) {
  return <button className={button({ variant, size, className })} {...props} />
}
\`\`\`

## Solução 3: @apply para estilos repetitivos (com moderação)

\`\`\`css
/* globals.css — apenas para padrões muito repetidos */
@layer components {
  .btn-base {
    @apply font-semibold rounded-lg transition-colors disabled:opacity-50;
  }

  .input-base {
    @apply border border-gray-300 rounded-md px-3 py-2 text-sm
           focus:outline-none focus:ring-2 focus:ring-blue-500;
  }
}
\`\`\`

> Use \`@apply\` com moderação — você perde o rastreamento de quais classes estão ativas quando inspeciona o elemento no DevTools.

## Tailwind v4: a nova sintaxe

No Tailwind v4, a configuração vai para o CSS:

\`\`\`css
@import "tailwindcss";

@theme {
  --color-brand: #1a56db;
  --font-heading: "Cal Sans", sans-serif;
  --radius-card: 12px;
}
\`\`\`

E você usa diretamente:

\`\`\`html
<div class="bg-brand text-white font-heading rounded-card">
  ...
</div>
\`\`\`

## Dicas de produtividade

**1. Ordene as classes consistentemente** — use o plugin Prettier do Tailwind:
\`\`\`bash
npm install -D prettier-plugin-tailwindcss
\`\`\`

**2. Use o IntelliSense** — extensão oficial para VS Code com autocomplete e preview de cores.

**3. Prefira \`gap\` a \`margin\` entre filhos** — mais flexível e evita margin collapse:
\`\`\`html
<!-- ✅ -->
<div class="flex flex-col gap-4">...</div>

<!-- ❌ Evite -->
<div>
  <p class="mb-4">...</p>
  <p class="mb-4">...</p>
</div>
\`\`\`

**4. Use variantes de grupo e peer para interações**:
\`\`\`html
<div class="group">
  <h2 class="group-hover:text-blue-600">Título</h2>
  <p class="opacity-0 group-hover:opacity-100 transition-opacity">Subtítulo</p>
</div>
\`\`\`

## Conclusão

Tailwind não é bagunça — é uma escolha de tradeoff: você troca a abstração de nomes semânticos por co-localização e velocidade de desenvolvimento. Com componentização adequada, o código fica tão manutenível quanto qualquer outra abordagem.`,
  },
  {
    slug: 'prisma-orm-guia-completo',
    title: 'Prisma ORM: do schema ao deploy com PostgreSQL',
    description: 'Prisma transformou como trabalhamos com banco de dados em Node.js. Aprenda schema design, migrations, queries avançadas e as armadilhas de performance mais comuns.',
    tags: ['Prisma', 'PostgreSQL', 'Node.js'],
    published: true,
    content: `Prisma é o ORM mais popular do ecossistema Node.js/TypeScript — e por boas razões. Ele combina um schema declarativo, type-safety de ponta a ponta e uma CLI poderosa. Mas muitos desenvolvedores usam apenas 20% do que ele oferece.

## Schema Design: os fundamentos

O arquivo \`schema.prisma\` é a fonte de verdade do seu banco:

\`\`\`prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  posts     Post[]
  profile   Profile?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([email])
}

model Post {
  id          String   @id @default(cuid())
  slug        String   @unique
  title       String
  content     String
  published   Boolean  @default(false)
  author      User     @relation(fields: [authorId], references: [id])
  authorId    String
  tags        String[]
  views       Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([authorId])
  @@index([published, createdAt(sort: Desc)])
}
\`\`\`

**Boas práticas de schema:**
- Use \`cuid()\` ou \`uuid()\` para IDs (evita enumeração)
- Sempre adicione \`@@index\` em campos usados em \`where\`
- Use \`updatedAt @updatedAt\` para rastrear mudanças
- Prefira \`String?\` (nullable) a valores default vazios

## Migrations: o fluxo correto

\`\`\`bash
# Desenvolvimento: cria e aplica migration
npx prisma migrate dev --name add_post_views

# Produção: apenas aplica migrations existentes
npx prisma migrate deploy

# Ver status das migrations
npx prisma migrate status
\`\`\`

**Nunca** use \`prisma db push\` em produção — ele pode causar perda de dados.

## Queries avançadas

### Select granular (evite over-fetching)

\`\`\`ts
// ❌ Busca tudo, incluindo campos pesados
const posts = await prisma.post.findMany()

// ✅ Busca apenas o necessário
const posts = await prisma.post.findMany({
  select: {
    id: true,
    title: true,
    slug: true,
    author: {
      select: { name: true },
    },
  },
  where: { published: true },
  orderBy: { createdAt: 'desc' },
  take: 10,
})
\`\`\`

### Transações

\`\`\`ts
// Operações atômicas
const [user, post] = await prisma.$transaction([
  prisma.user.create({ data: { email: 'user@email.com' } }),
  prisma.post.create({ data: { title: 'Meu post', authorId: '...' } }),
])

// Transação interativa (para lógica condicional)
const result = await prisma.$transaction(async (tx) => {
  const user = await tx.user.findUnique({ where: { id: userId } })
  if (!user) throw new Error('Usuário não encontrado')

  return tx.post.create({
    data: { title, authorId: user.id }
  })
})
\`\`\`

### Upsert

\`\`\`ts
// Cria ou atualiza em uma operação
await prisma.user.upsert({
  where: { email: 'user@email.com' },
  update: { name: 'Novo Nome' },
  create: { email: 'user@email.com', name: 'Novo Nome' },
})
\`\`\`

## N+1: o problema mais comum

\`\`\`ts
// ❌ N+1: 1 query para posts + 1 query por post para autor
const posts = await prisma.post.findMany()
for (const post of posts) {
  const author = await prisma.user.findUnique({ where: { id: post.authorId } })
}

// ✅ Uma query com include
const posts = await prisma.post.findMany({
  include: { author: true },
})
\`\`\`

## Singleton no desenvolvimento (Next.js)

Hot reload cria múltiplas instâncias do Prisma Client. Use o padrão singleton:

\`\`\`ts
// lib/db.ts
const globalForPrisma = globalThis as { prisma?: PrismaClient }

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query'] : [],
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
\`\`\`

## Conclusão

Prisma elimina uma categoria inteira de bugs (erros de SQL em runtime) e acelera o desenvolvimento. Invista tempo no schema design e nos índices — a maioria dos problemas de performance em produção começa aí.`,
  },
  {
    slug: 'seo-tecnico-nextjs',
    title: 'SEO técnico no Next.js: metadata, sitemaps e tudo que importa para o Google',
    description: 'SEO não é só palavras-chave. Aprenda a configurar metadata dinâmica, sitemap automático, robots.txt, structured data e Open Graph no Next.js App Router.',
    tags: ['SEO', 'Next.js', 'Performance'],
    published: true,
    content: `SEO técnico é a base sobre a qual toda estratégia de conteúdo precisa estar construída. De nada adianta escrever ótimos artigos se o Google não consegue indexar suas páginas corretamente. No Next.js App Router, a maioria dessas configurações é declarativa e type-safe.

## Metadata API: o básico correto

\`\`\`tsx
// app/layout.tsx
export const metadata: Metadata = {
  metadataBase: new URL('https://seusite.com'),
  title: {
    default: 'Meu Blog',
    template: '%s | Meu Blog', // páginas filhas usam: "Post Title | Meu Blog"
  },
  description: 'Blog sobre desenvolvimento web moderno',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Meu Blog',
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
}
\`\`\`

## Metadata dinâmica por página

\`\`\`tsx
// app/blog/[slug]/page.tsx
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost(params.slug)

  if (!post) return { title: 'Post não encontrado' }

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.createdAt.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: ['https://seusite.com/sobre'],
      tags: post.tags,
    },
    alternates: {
      canonical: \`https://seusite.com/blog/\${post.slug}\`,
    },
  }
}
\`\`\`

## Sitemap automático

\`\`\`tsx
// app/sitemap.ts
import { MetadataRoute } from 'next'
import { prisma } from '@/lib/db'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await prisma.post.findMany({
    where: { published: true },
    select: { slug: true, updatedAt: true },
  })

  const postUrls = posts.map((post) => ({
    url: \`https://seusite.com/blog/\${post.slug}\`,
    lastModified: post.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [
    {
      url: 'https://seusite.com',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://seusite.com/blog',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...postUrls,
  ]
}
\`\`\`

## robots.txt

\`\`\`tsx
// app/robots.ts
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api'],
      },
    ],
    sitemap: 'https://seusite.com/sitemap.xml',
  }
}
\`\`\`

## Structured Data (JSON-LD)

Schema.org ajuda o Google a entender o conteúdo e pode gerar rich results:

\`\`\`tsx
// components/ArticleJsonLd.tsx
export function ArticleJsonLd({ post }: { post: Post }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.createdAt,
    dateModified: post.updatedAt,
    author: {
      '@type': 'Person',
      name: 'Seu Nome',
      url: 'https://seusite.com/sobre',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Meu Blog',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
\`\`\`

## Links canônicos

Evite conteúdo duplicado com canonical:

\`\`\`tsx
export async function generateMetadata({ params }: Props) {
  return {
    alternates: {
      canonical: \`https://seusite.com/blog/\${params.slug}\`,
    },
  }
}
\`\`\`

## Checklist de SEO técnico

- [ ] \`metadataBase\` configurado em \`layout.tsx\`
- [ ] Title único e descritivo em cada página (< 60 caracteres)
- [ ] Meta description única (< 160 caracteres)
- [ ] Open Graph configurado (og:title, og:description, og:image)
- [ ] \`/sitemap.xml\` gerado dinamicamente
- [ ] \`/robots.txt\` configurado
- [ ] Links canônicos em páginas com conteúdo duplicado
- [ ] JSON-LD para artigos e páginas importantes
- [ ] URLs semânticas (sem query params para conteúdo)
- [ ] Imagens com atributo \`alt\` descritivo

## Conclusão

SEO técnico no Next.js App Router é declarativo e type-safe — o TypeScript vai te avisar se esquecer campos obrigatórios. Configure uma vez corretamente e o Google vai agradecer.`,
  },
  {
    slug: 'autenticacao-nextauth-v5',
    title: 'Autenticação moderna com Auth.js v5 no Next.js App Router',
    description: 'Auth.js v5 (NextAuth) foi completamente reescrito para o App Router. Aprenda a implementar login com credentials, OAuth e como proteger rotas com middleware.',
    tags: ['Next.js', 'Auth', 'Segurança'],
    published: true,
    content: `Auth.js v5 — anteriormente conhecido como NextAuth — foi completamente reescrito para o Next.js App Router. A API é mais simples, o runtime é Edge-compatible por padrão e a integração com Server Components é nativa. Mas existem armadilhas específicas do Edge Runtime que você precisa conhecer.

## Instalação e configuração base

\`\`\`bash
npm install next-auth@beta
\`\`\`

\`\`\`ts
// lib/auth.ts
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = z.object({
          email: z.string().email(),
          password: z.string().min(8),
        }).safeParse(credentials)

        if (!parsed.success) return null

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        })

        if (!user) return null

        const valid = await bcrypt.compare(parsed.data.password, user.password)
        if (!valid) return null

        return { id: user.id, email: user.email, name: user.name }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
})
\`\`\`

## O problema do Edge Runtime

O middleware do Next.js roda no Edge Runtime, que não suporta módulos Node.js como \`bcryptjs\`, \`pg\` e \`@prisma/client\`. A solução é separar a configuração em dois arquivos:

\`\`\`ts
// lib/auth.config.ts — Edge-compatible (sem Prisma/bcrypt)
import type { NextAuthConfig } from 'next-auth'

export const authConfig: NextAuthConfig = {
  pages: { signIn: '/login' },
  callbacks: {
    authorized({ auth, request }) {
      const isAdmin = request.nextUrl.pathname.startsWith('/admin')
      return isAdmin ? !!auth?.user : true
    },
  },
  providers: [], // providers reais ficam em auth.ts
  session: { strategy: 'jwt' },
}
\`\`\`

\`\`\`ts
// proxy.ts (ou middleware.ts em versões antigas)
import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth.config'

export default NextAuth(authConfig).auth

export const config = {
  matcher: ['/admin/:path*'],
}
\`\`\`

\`\`\`ts
// lib/auth.ts — usa authConfig + providers completos
import NextAuth from 'next-auth'
import { authConfig } from './auth.config'
import Credentials from 'next-auth/providers/credentials'

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [Credentials({ /* ... */ })],
})
\`\`\`

## Route Handler

\`\`\`ts
// app/api/auth/[...nextauth]/route.ts
import { handlers } from '@/lib/auth'
export const { GET, POST } = handlers
\`\`\`

## Server Actions para login/logout

\`\`\`ts
// actions/auth.ts
'use server'

import { signIn, signOut } from '@/lib/auth'
import { redirect } from 'next/navigation'

export async function loginAction(formData: FormData) {
  try {
    await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      redirectTo: '/admin/posts',
    })
  } catch (error) {
    return { error: 'Credenciais inválidas' }
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: '/login' })
}
\`\`\`

## Verificando sessão em Server Components

\`\`\`tsx
// app/admin/layout.tsx
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }) {
  const session = await auth()
  if (!session) redirect('/login')

  return <div>{children}</div>
}
\`\`\`

## OAuth com GitHub/Google

Adicionar OAuth é simples — o Auth.js cuida de toda a complexidade:

\`\`\`ts
import GitHub from 'next-auth/providers/github'
import Google from 'next-auth/providers/google'

export const { handlers, auth } = NextAuth({
  providers: [
    GitHub, // GITHUB_ID e GITHUB_SECRET nas env vars
    Google, // GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET
    Credentials({ /* ... */ }),
  ],
})
\`\`\`

## Conclusão

Auth.js v5 é opinionado por design — ele te força a separar a configuração Edge do código Node.js, o que resulta em um middleware mais performático. O custo é um pouco mais de configuração inicial, mas a segurança e a integração com Server Components compensam.`,
  },
  {
    slug: 'deploy-vercel-guia-completo',
    title: 'Deploy na Vercel: do repositório ao domínio customizado',
    description: 'Tudo que você precisa saber para fazer deploy de uma aplicação Next.js na Vercel — preview deployments, variáveis de ambiente, domínios e configurações de produção.',
    tags: ['Vercel', 'Deploy', 'Next.js'],
    published: true,
    content: `A Vercel é a plataforma criada pelo mesmo time do Next.js — não é coincidência que a integração seja impecável. Mas existe um universo de configurações e boas práticas que a maioria dos desenvolvedores nunca explora. Este guia cobre tudo desde o primeiro deploy até configurações avançadas.

## Deploy inicial em 3 passos

1. **Envie o código para o GitHub** (ou GitLab/Bitbucket)
2. **Importe o repositório** em vercel.com/new
3. **Configure as variáveis de ambiente** e clique em Deploy

A Vercel detecta automaticamente que é um projeto Next.js e configura o build sem precisar de nenhuma configuração adicional.

## Variáveis de ambiente

A Vercel tem três escopos para env vars:

- **Production** — apenas no branch principal (main/master)
- **Preview** — em todos os outros branches
- **Development** — para \`vercel env pull\` (uso local)

\`\`\`bash
# Baixar variáveis de desenvolvimento para .env.local
vercel env pull .env.local
\`\`\`

**Variáveis importantes para projetos Next.js:**

\`\`\`bash
# Banco de dados (obrigatório para Prisma/Neon)
DATABASE_URL="postgresql://user:pass@host-pooler.neon.tech/db?sslmode=verify-full"

# Auth.js
AUTH_SECRET="string-aleatoria-de-32-caracteres"

# URL do site (para metadataBase e OG images)
NEXT_PUBLIC_SITE_URL="https://seusite.vercel.app"
\`\`\`

**Prefixo NEXT_PUBLIC_:** variáveis sem o prefixo são server-only. Com o prefixo, ficam expostas no browser — use apenas para dados não-sensíveis.

## Preview Deployments

Cada pull request recebe um URL único de preview. Isso permite:

- Testar mudanças antes de mergear
- Compartilhar previews com stakeholders
- Ver histórico de deployments por commit

Para usar um banco de dados separado em preview (recomendado):
1. Crie um branch no Neon (ou outro banco)
2. Configure \`DATABASE_URL\` para o escopo Preview com o URL do branch

## next.config.ts: configurações essenciais

\`\`\`ts
import type { NextConfig } from 'next'

const config: NextConfig = {
  // Necessário para Prisma no Vercel
  serverExternalPackages: ['@prisma/client'],

  // Headers de segurança
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
        ],
      },
    ]
  },

  // Redirects
  async redirects() {
    return [
      {
        source: '/artigos/:slug',
        destination: '/blog/:slug',
        permanent: true, // 301
      },
    ]
  },
}

export default config
\`\`\`

## package.json: build com Prisma

\`\`\`json
{
  "scripts": {
    "build": "prisma generate && next build",
    "postinstall": "prisma generate"
  }
}
\`\`\`

O \`postinstall\` garante que o Prisma Client seja gerado após \`npm install\` na Vercel.

## Domínio customizado

1. Vá em **Settings → Domains** no painel do projeto
2. Adicione seu domínio (ex: seusite.com)
3. Configure os DNS no seu provedor:
   - Para apex domain (\`seusite.com\`): registro A para \`76.76.21.21\`
   - Para subdomínio (\`www.seusite.com\`): CNAME para \`cname.vercel-dns.com\`
4. SSL é configurado automaticamente (Let's Encrypt)

## Função Serverless vs Edge

Por padrão, as rotas Next.js rodam como funções Serverless (Node.js). Para rotas que precisam de menor latência global:

\`\`\`ts
// app/api/status/route.ts
export const runtime = 'edge' // roda em 40+ regiões simultaneamente

export function GET() {
  return Response.json({ status: 'ok' })
}
\`\`\`

Edge runtime não suporta Node.js APIs — use apenas para respostas simples ou transformações.

## Monitoramento

A Vercel oferece:
- **Analytics** — métricas de Core Web Vitals por página
- **Speed Insights** — dados reais de visitantes
- **Logs** — logs de funções Serverless em tempo real
- **Checks** — integração com testes automáticos no CI

## Rollback instantâneo

Se um deploy quebrar produção, o rollback é imediato:
1. Abra o deploy anterior no painel
2. Clique em **Promote to Production**
3. Em segundos, o tráfego volta para a versão anterior

## Conclusão

A Vercel abstrai a infraestrutura para que você foque no produto. Preview deployments, rollback instantâneo e integração nativa com Next.js tornam o ciclo de desenvolvimento muito mais seguro. Configure as variáveis de ambiente corretamente desde o início — é aí que mora a maioria dos problemas de deploy.`,
  },
]

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL
  const adminPassword = process.env.SEED_ADMIN_PASSWORD

  if (!adminEmail || !adminPassword) {
    throw new Error('SEED_ADMIN_EMAIL e SEED_ADMIN_PASSWORD precisam estar definidos no .env.local')
  }

  // 1. Cria o usuário admin
  const hashedPassword = await bcrypt.hash(adminPassword, 12)
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: hashedPassword,
      name: 'Admin',
    },
  })
  console.log(`✓ Admin criado: ${adminEmail}`)

  // 2. Insere os 10 posts
  for (const post of posts) {
    await prisma.post.upsert({
      where: { slug: post.slug },
      update: {
        title: post.title,
        description: post.description,
        content: post.content,
        tags: post.tags,
        published: post.published,
      },
      create: post,
    })
    console.log(`✓ Post: ${post.title}`)
  }

  console.log(`\n✅ Seed concluído — ${posts.length} posts inseridos!`)
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
