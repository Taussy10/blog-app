# Supabase Auth Setup Guide (Next.js SSR + PKCE)

This guide outlines a professional authentication system using **Next.js**, **Supabase**, and `@supabase/ssr`. It implements a robust middleware guard, PKCE flow for OAuth/Magic Links, and a clean folder structure.

---

## 1. Prerequisites & Env
Install dependencies:
`npm install @supabase/ssr @supabase/supabase-js`

Setup `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 2. Library Setup (The Core)

### `lib/supabase/client.ts` (Browser Client)
Used for client-side interactivity (forms, logout button).
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### `lib/supabase/server.ts` (Server Client)
Used in Server Components, Actions, and Route Handlers. Syncs session via cookies.
```typescript
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createClient() {
    const cookieStore = await cookies()

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll() },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) => 
                            cookieStore.set(name, value, options))
                    } catch { /* Handled by middleware */ }
                },
            },
        }
    )
}
```

---

## 3. The Gatekeeper (Middleware)

### `lib/middleware.ts`
This logic updates the session cookie and protects private routes.
```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data } = await supabase.auth.getClaims()
  const user = data?.claims

  // Define Public routes (No login needed)
  const publicRoutes = ['/', '/login', '/sign-up', '/callback', '/confirm', '/error']
  
  const isPublicRoute = request.nextUrl.pathname === '/' || 
    publicRoutes.some(route => route !== '/' && request.nextUrl.pathname.startsWith(route))

  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
```

### `middleware.ts` (Root)
Ensure it ignores static assets.
```typescript
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

---

## 4. Auth Route Handlers (PKCE)

### `app/(auth)/callback/route.ts`
Handles Google OAuth and Magic Link redirections (PKCE flow).
```typescript
import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/dashboard'

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) return NextResponse.redirect(`${origin}${next}`)
    }
    return NextResponse.redirect(`${origin}/error?error=AuthFailed`)
}
```

---

## 5. UI Implementation logic

- **Folder Groups**: Use `(auth)` for login/signup and `(protected)` for things like `/dashboard`. URLs will not include the parentheses.
- **Magic Links**: `emailRedirectTo` MUST point to `/callback` because `@supabase/ssr` uses PKCE (which sends a `?code=`).
- **Logout**: Use `const supabase = createClient()` (from `lib/client.ts`) and call `await supabase.auth.signOut()`.

---

## Summary of logic
1. **Middleware** checks cookies on every request.
2. If token is expired, `updateSession` refreshes it.
3. **PKCE Flow** (Code Exchange) is used for security.
4. **Route Groups** keep organized but keep URLs clean.
