import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'

import { createClient } from '@/lib/supabase/server'

/**
 * OAuth callback route.
 * After Google (or any OAuth provider) authenticates the user, Supabase
 * redirects here with a one-time `code` in the query string.
 * We exchange that code for a session and then redirect to the protected route.
 */
export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/dashboard'

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            return NextResponse.redirect(`${origin}${next}`)
        }

        return NextResponse.redirect(
            `${origin}/error?error=${encodeURIComponent(error.message)}`
        )
    }

    return NextResponse.redirect(
        `${origin}/error?error=${encodeURIComponent('Missing OAuth code')}`
    )
}
