# Supabase Auth Setup Guide (Next.js SSR + PKCE - Passwordless)

This guide outlines a professional, **passwordless** authentication system using **Next.js**, **Supabase**, and `@supabase/ssr`. It implements a robust middleware guard, PKCE flow for OAuth/Magic Links, and a clean folder structure.

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

  // These are the public routes that are accessible WITHOUT being logged in
  const publicRoutes = ['/', '/login', '/callback', '/confirm', '/error']
  
  // LOGIC: Check if current page is public
  const isPublicRoute =
    request.nextUrl.pathname === '/' ||   // Exact match for landing
    publicRoutes.some(
      (route) => route !== '/' && request.nextUrl.pathname.startsWith(route)
    )

  // 1. GUEST REDIRECT: If logged out and trying to touch private pages -> /login
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // 2. AUTH REDIRECT: If logged in and trying to access landing/login -> /dashboard
  if (user && (request.nextUrl.pathname === '/' || request.nextUrl.pathname === '/login')) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
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

- **Folder Groups**: Use `(auth)` for login/callback and `(protected)` for things like `/dashboard`.
- **Magic Links**: `emailRedirectTo` MUST point to `/callback` because `@supabase/ssr` uses PKCE (which sends a `?code=`).
- **Google Login**: Set `redirectTo` to point to `/callback?next=/dashboard`.
- **Logout**: Use `const supabase = createClient()` and call `await supabase.auth.signOut()`.
- **No Passwords**: Since we use Magic Links and Google OAuth, there is no need for Sign Up or Forgot Password pages.

---

## Key Middleware Logic (Explained)
- **`isPublicRoute` with `||`**: Works on a "Happy if any one says Yes" rule. If the first check (landing page) is true, it stops immediately.
- **Why `route !== '/'` in loop?**: Because `startsWith('/')` matches every page on your site. We handle the landing page separately with an exact match to keep private pages safe.
- **Specific Redirects**: We only redirect logged-in users from `/` and `/login`. We don't redirect them from `/error` or `/confirm` because they might still need to see those pages.

---

## Summary
1. **Middleware** checks cookies and handles redirects on every request.
2. **PKCE Flow** handles the secure exchange of codes for sessions.
3. **Passwordless Strategy** removes the friction of passwords and the need for reset-password flows.
