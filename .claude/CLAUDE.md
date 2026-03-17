# AI Development Rules

This document outlines the technology stack, conventions, and specific library usage guidelines for this Next.js application. Adhering to these rules will help maintain consistency and ensure the AI assistant can effectively understand and modify the codebase.

---

## Tech Stack Overview

| Area           | Technology                                                     |
| -------------- | -------------------------------------------------------------- |
| **Framework**  | Next.js (App Router)                                           |
| **Language**   | TypeScript (strict mode)                                       |
| **Styling**    | Tailwind CSS                                                   |
| **Forms**      | React Hook Form + Zod                                          |
| **Validation** | Zod                                                            |
| **Database**   | Supabase _(if used — handled entirely by `SUPABASE_AGENT.md`)_ |
| **State**      | React Context API + `useState` / `useReducer`                  |

---

## General Rules

- **Single Responsibility Principle (SRP).** Each function, module, and file should have one reason to change — one clear responsibility. When a file or function grows to handle multiple concerns, split it into smaller, focused units.
- **Never create a file just because it appears in an example below.** Examples illustrate patterns — only create files when the project actually needs them.
- **Supabase is handled by a dedicated agent.** Any task involving database schema, migrations, RLS, indexes, or type generation must be delegated to `SUPABASE_AGENT.md`. Do not write Supabase-related code from this document.

- É obrigatorio que a pasta **app** esteja dentro da pasta **src**, e para isso funcionar o **tsconfig.json** deve ser atualizado na parte dos paths

## Project Initialization

O projeto já inicializado com o script padrão do proprio NextJs.

Then install the additional dependencies:

```bash
npm install zod react-hook-form @hookform/resolvers clsx tailwind-merge
```

> If the project uses Supabase, refer to `SUPABASE_AGENT.md` for installation and setup.

---

## Folder Structure

Only create the folders the project actually needs. The structure below is the maximum possible — not all of it is required.

```
src/
├── app/                     # App Router — routes, layouts, pages, actions
├── components/
│   ├── ui/                  # Reusable visual components
├── lib/
│   ├── validations/         # Zod schemas
│   └── utils.ts             # Utility functions (cn, slugify, etc.)
├── hooks/                   # Custom React hooks (only if reused in 2+ places)
└── types/                   # Global TypeScript types
```

> Supabase-specific folders (`repositories/`, `lib/supabase/`, `supabase/migrations/`, `middleware.ts`) are defined in `SUPABASE_AGENT.md`.

---

## Environment Variables

Always create `.env.local` at the project root and `.env.example` for version control. Never commit `.env.local`.

```env
# .env.local
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=MyApp
```

```env
# .env.example — no real values, safe to commit
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_APP_NAME=
```

> Supabase environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) are managed by `SUPABASE_AGENT.md`.

---

## Library Usage Guidelines

### 1. Styling

- **Primary choice**: Exclusively use Tailwind CSS utility classes for all styling.
- **Do not** use `style={{}}` inline props except for truly dynamic values (e.g., `style={{ width: \`${progress}%\` }}`).
- **Do not** use CSS-in-JS libraries (Styled Components, Emotion, etc.).
- **Global styles**: Reserve `src/app/globals.css` for Tailwind directives and CSS variable definitions only.
- Always install `clsx` and `tailwind-merge` and create `src/lib/utils.ts` with the `cn()` helper:

```typescript
// src/lib/utils.ts — create this file in every project
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### 2. UI Components

- Every component in `components/ui/` must: accept `className` as a prop, use `cn()` to merge classes, and use `forwardRef` when wrapping a native HTML element.
- Use lookup objects for variants — never chained ternaries:

```typescript
// ✅ Correct
const variants = {
  primary:   'bg-blue-600 text-white hover:bg-blue-700',
  secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
}

// ❌ Avoid
className={variant === 'primary' ? 'bg-blue-600' : variant === 'secondary' ? '...' : '...'}
```

_Example — do not create this file. Use as a reference pattern when building any `components/ui/` component:_

```typescript
import { cn } from '@/lib/utils'
import { forwardRef, ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  loading?: boolean
}

const variants = {
  primary:   'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
  secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-300',
  ghost:     'text-gray-700 hover:bg-gray-100 focus:ring-gray-200',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', loading, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium px-4 py-2',
        'min-h-[44px] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        className
      )}
      {...props}
    >
      {loading && <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
      {children}
    </button>
  )
)
Button.displayName = 'Button'
```

### 3. Google Fonts

- Always configure fonts in `src/app/layout.tsx` via `next/font/google`. Never use a `<link>` tag to import fonts.
- After configuring, add the CSS variables to `tailwind.config.ts` under `theme.extend.fontFamily`.

_Example — adapt the chosen fonts to the project:_

```typescript
// src/app/layout.tsx
import type { Metadata, Viewport } from 'next'
import { Inter, Poppins } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })
const poppins = Poppins({ subsets: ['latin'], weight: ['400','500','600','700'], variable: '--font-poppins', display: 'swap' })

export const metadata: Metadata = {
  title: {
    default: process.env.NEXT_PUBLIC_APP_NAME ?? 'MyApp',
    template: `%s | ${process.env.NEXT_PUBLIC_APP_NAME ?? 'MyApp'}`,
  },
  description: 'App description',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  openGraph: { type: 'website', locale: 'pt_BR' },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#2563eb',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${poppins.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
```

```typescript
// tailwind.config.ts — add inside theme.extend
fontFamily: {
  sans:    ['var(--font-inter)', 'sans-serif'],
  heading: ['var(--font-poppins)', 'sans-serif'],
},
```

### 4. Forms & Validation

- Use `react-hook-form` for all form logic (state, validation, submission).
- Use `zod` for schema-based validation via `@hookform/resolvers`.
- Place all Zod schemas in `src/lib/validations/`.
- Always validate on the server (security) and optionally on the client (UX).

_Example — do not create these files. Use as a reference pattern for real schemas and forms:_

```typescript
// Pattern: src/lib/validations/[entity].ts
import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string({ required_error: "Required" })
    .email("Invalid email")
    .toLowerCase(),
  password: z
    .string({ required_error: "Required" })
    .min(6, "Minimum 6 characters"),
});

export type LoginInput = z.infer<typeof loginSchema>;
```

```typescript
// Pattern: form component with react-hook-form + zod
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginInput } from '@/lib/validations/auth'

export function LoginForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(data: LoginInput) {
    const fd = new FormData()
    Object.entries(data).forEach(([k, v]) => fd.append(k, v))
    // call your server action here
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full max-w-sm mx-auto">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          id="email" type="email" autoComplete="email"
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
          {...register('email')}
        />
        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
      </div>
      <button type="submit" disabled={isSubmitting}
        className="w-full min-h-[44px] rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50">
        {isSubmitting ? 'Loading...' : 'Sign in'}
      </button>
    </form>
  )
}
```

### 5. State Management

- **Local state**: Use `useState` and `useReducer` for component-level state.
- **Shared state**: For state shared between multiple components, use React Context API.
- **Do not** introduce external state management libraries (Zustand, Jotai, Redux, etc.) without explicit discussion.

### 6. Routing & Data Fetching

- Use the Next.js App Router (file-system routing in `src/app/`).
- **Server-side**: Use Server Actions (in `app/**/actions.ts`) or Route Handlers (`src/app/api/`) for server-side logic.
- **Client-side**: Use the native `fetch` API.
- Fetch data directly in async Server Components — never with `useEffect`.

_Example — do not create this action. Use as a reference pattern for Server Actions with Zod:_

```typescript
// Pattern: src/app/[route]/actions.ts
"use server";

import { someSchema } from "@/lib/validations/some";
import { revalidatePath } from "next/cache";

export async function createSomethingAction(formData: FormData) {
  const parsed = someSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  try {
    // perform the operation directly here (e.g. database call via repository)
    revalidatePath("/some-path");
    return { data: result };
  } catch (err) {
    return { error: (err as Error).message };
  }
}
```

### 7. React Patterns

- **Server Components by default.** Only add `'use client'` when the component needs interactive events, state hooks, or browser APIs.
- Use `interface` for component props and contracts; `type` for unions and intersections.
- Create a custom hook in `hooks/` only if the logic is reused in 2 or more components.
- Use `Suspense` to isolate async parts and show skeletons without blocking the entire page.

_Example — do not create this page. Use as a reference pattern for Server Components with Suspense:_

```typescript
// Pattern: src/app/[entity]/page.tsx
import { Suspense } from 'react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Posts',
  description: 'Post listing',
}

async function PostList() {
  // fetch data directly in the async Server Component
  const posts = await fetchPosts(20)

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <li key={post.id} className="rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
          <h2 className="font-semibold text-lg">{post.title}</h2>
        </li>
      ))}
    </ul>
  )
}

function PostListSkeleton() {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <li key={i} className="rounded-xl border border-gray-200 p-5 animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-3/4" />
        </li>
      ))}
    </ul>
  )
}

export default function PostsPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Posts</h1>
      <Suspense fallback={<PostListSkeleton />}>
        <PostList />
      </Suspense>
    </main>
  )
}
```

### 8. Mobile Optimization

Apply these rules to every interactive or input component:

- Interactive elements (buttons, links, clickable icons): `min-h-[44px] min-w-[44px]`.
- Inputs: always `text-base` (16px) — prevents auto-zoom on iOS.
- Minimum horizontal padding on pages: `px-4`.
- Images: always use `next/image` with a responsive `sizes` prop.

_Example — adapt `sizes` to the actual layout:_

```typescript
import Image from 'next/image'

<Image
  src="/hero.jpg"
  alt="Image description"
  fill
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  className="object-cover"
  priority // only for above-the-fold images
/>
```

### 9. SEO

- Every `page.tsx` must export `metadata` (static) or `generateMetadata` (dynamic).
- Always create `src/app/robots.ts`. Adapt the private paths to the project.

_Example — adapt titles, descriptions, and fields to the actual page content:_

```typescript
// Static metadata
export const metadata: Metadata = {
  title: "Page Title",
  description: "150-160 character description.",
  openGraph: {
    title: "Page Title",
    description: "Social sharing description.",
    images: [{ url: "/og/page.png", width: 1200, height: 630 }],
  },
};

// Dynamic metadata
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  try {
    const post = await fetchPostBySlug(params.slug);
    return { title: post.title, description: post.excerpt ?? "" };
  } catch {
    return { title: "Not found" };
  }
}
```

```typescript
// src/app/robots.ts — always create this file
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/dashboard/", "/api/"] }, // adapt to project
    sitemap: `${process.env.NEXT_PUBLIC_APP_URL}/sitemap.xml`,
  };
}
```

_Example — create `src/app/sitemap.ts` only if the project has indexable public content:_

```typescript
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL!;
  const posts = await fetchPublishedPosts(1000);

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...posts.map((post) => ({
      url: `${baseUrl}/posts/${post.slug}`,
      lastModified: new Date(post.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
```

### 10. TypeScript

- Write all code in TypeScript with `strict: true` in `tsconfig.json`.
- Avoid `any`. Use `unknown` + type narrowing when the type is uncertain.
- Use `interface` for props and contracts; `type` for unions and intersections.

### 11. Utility Functions

- Place general-purpose helper functions in `src/lib/utils.ts`.
- Ensure functions are well-typed and serve a clear, reusable purpose.

### 12. Custom Hooks

- Place custom React hooks in `src/hooks/`.
- Only create a custom hook if the logic is reused across 2 or more components.

---

## Separation of Concerns

| Layer             | Where               | Responsibility                                            |
| ----------------- | ------------------- | --------------------------------------------------------- |
| **Pages**         | `app/**/page.tsx`   | Metadata, fetch data in async Server Components, render   |
| **Actions**       | `app/**/actions.ts` | Server-side mutations — validate with Zod, execute logic  |
| **Repositories**  | `repositories/`     | Single point of database access — see `SUPABASE_AGENT.md` |
| **Components UI** | `components/ui/`    | Reusable visual elements, no business logic               |
| **Hooks**         | `hooks/`            | Reusable state and side-effects (2+ components)           |
| **Lib**           | `lib/`              | External clients, Zod schemas, utilities                  |
| **Types**         | `types/`            | Global types and interfaces                               |

---

## Pre-delivery Checklist

Verify all applicable items before considering a task complete:

- [ ] `.env.local` created and `.env.example` committed
- [ ] `metadata` or `generateMetadata` exported from every `page.tsx`
- [ ] `viewport` with `maximumScale: 1` in root layout
- [ ] Interactive elements with touch targets ≥ 44px
- [ ] Inputs with `text-base` (16px) to prevent iOS auto-zoom
- [ ] Zod validation on the server in every Server Action
- [ ] `next/image` with responsive `sizes` for all images
- [ ] No `console.log` or sensitive data exposed
- [ ] No `any` in TypeScript
- [ ] If using Supabase: all database checklist items in `SUPABASE_AGENT.md` verified
