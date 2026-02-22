# Instruction: Implementing Supabase Google Social Auth in Next.js

This document provides exact instructions and code snippets to enable Google Social Authentication using Supabase and Next.js (App Router with SSR).

---

## 🛠 Tech Stack
- **Framework**: Next.js 15+ (App Router)
- **Auth**: Supabase Auth with `@supabase/ssr`
- **Flow**: PKCE (Authorization Code Flow)

---

## 1. External Configuration (Prerequisites)

### A. Google Cloud Console (GCP)
1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project or select an existing one.
3. Search for **"APIs & Services"** > **"OAuth consent screen"**.
   - Choose **External**.
   - Fill in App Name, User Support Email, and Developer Contact Info.
4. Go to **"Credentials"** > **"Create Credentials"** > **"OAuth client ID"**.
   - Application type: **Web application**.
   - Name: `Supabase Auth`.
   - **Authorized redirect URIs**: Add `https://<PROJECT_ID>.supabase.co/auth/v1/callback`.
     *(Find your PROJECT_ID in Supabase Settings > API)*.
5. Copy the **Client ID** and **Client Secret**.

### B. Supabase Dashboard
1. Go to your [Supabase Project](https://supabase.com/dashboard).
2. Navigate to **Authentication** > **Providers**.
3. Enable **Google**.
4. Paste the **Client ID** and **Client Secret** from GCP.
5. Click **Save**.

---

## 2. Project Environment Variables
Ensure your `.env.local` (or equivalent) has these entries:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_ANON_KEY=your-anon-key
```

---

## 3. Core Supabase Utility Files
*The AI should ensure these files exist for SSR to work correctly.*

### `lib/supabase/client.ts` (Browser Client)
```typescript
import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_ANON_KEY!
    )
}
```

### `lib/supabase/server.ts` (Server Client)
```typescript
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createClient() {
    const cookieStore = await cookies()

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll() },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) => 
                            cookieStore.set(name, value, options))
                    } catch (error) { /* Handle Server Component cookie constraints */ }
                },
            },
        }
    )
}
```

---

## 4. Auth Callback Terminal (The Bridge)
### `app/(auth)/callback/route.ts`
This route exchanges the Google auth code for a user session.
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

    // Redirect to error page if exchange fails
    return NextResponse.redirect(`${origin}/error?error=OAuthFail`)
}
```

---

## 5. UI Implementation: Google Login Button
### `components/auth/GoogleLoginButton.tsx`
```tsx
'use client'

import { createClient } from '@/lib/supabase/client'

export default function GoogleLoginButton() {
    const supabase = createClient()

    const handleLogin = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                // Must match the callback route created above
                redirectTo: `${window.location.origin}/callback?next=/dashboard`,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                },
            },
        })
    }

    return (
        <button 
            onClick={handleLogin}
            className="flex items-center justify-center gap-3 bg-white text-[#1f1f1f] border border-[#dadce0] px-6 py-2.5 rounded-full font-medium hover:bg-[#f8f9fa] hover:shadow-md transition-all active:scale-95 shadow-sm"
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                <path fill="none" d="M0 0h48v48H0z"/>
            </svg>
            Sign in with Google
        </button>
    )
}
```

---

## 6. Route Protection (Middleware)
Ensure your `middleware.ts` handles session refresh and protects the `/dashboard` route.

### 💡 AI Implementation Task
**"AI, please use the above instruction to:"**
1. Check if `lib/supabase/server.ts` and `client.ts` match the SSR patterns (Already present in workspace).
2. Verify `app/(auth)/callback/route.ts` is correctly implemented (Already present in workspace).
3. Create the `components/auth/GoogleLoginButton.tsx` file with the provided code.
4. Integrate the `GoogleLoginButton` into the existing `/login` page or create it if missing.
5. Ensure environment variables in `.env.local` use the names `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_ANON_KEY`.
