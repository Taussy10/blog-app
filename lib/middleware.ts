import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// It's route guard: It runs on every single request before any page loads.
// It's used to protect routes and to redirect users to the login page if they are not authenticated.

export async function updateSession(request: NextRequest) {
  // Create an intial response object
  let supabaseResponse = NextResponse.next({
    request,
  })

  // With supbase server client  Always create a new one on each request.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        // First set on the request
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          // Then recreate the response with the updated request
          supabaseResponse = NextResponse.next({
            request,
          })
          // Then set on the response (so the browser gets them)

          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Check if user is looged in ?
  //  reads the session token from cookies(in browser) and 
  // extracts the user's claims (email, ID, role, etc.)
  // without making a network call — it's fast and local.
  const { data } = await supabase.auth.getClaims()
  const user = data?.claims

  // Define public routes — accessible WITHOUT being logged in
  const publicRoutes = [
    '/',                   // landing page (exact match)
    '/login',
    '/sign-up',
    '/sign-up-success',
    '/forgot-password',
    '/update-password',
    '/confirm',            // magic link confirm handler
    '/callback',           // Google OAuth callback
    '/error',
  ]

  const isPublicRoute =
    request.nextUrl.pathname === '/' ||   // exact match for landing page
    publicRoutes.some(
      (route) => route !== '/' && request.nextUrl.pathname.startsWith(route)
    )

  if (!user && !isPublicRoute) {
    // then redirect to login page
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse
}
