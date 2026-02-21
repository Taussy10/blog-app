import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// It's route guard: It runs on every single request before any page loads.
// It's used to protect routes and to redirect users to the login page if they are not authenticated.

export async function updateSession(request: NextRequest) {
  // Create an intial response object
  let supabaseResponse = NextResponse.next({
    request,
  })

  // With supbase server client  Always create a new one on each request.
  const supabase = createClient()

  // Check if user is looged in ?
  //  reads the session token from cookies(in browser) and 
  // extracts the user's claims (email, ID, role, etc.)
  // without making a network call — it's fast and local.
  const { data } = await (await supabase).auth.getClaims()
  const user = data?.claims

  // These are the public routes that are accessible WITHOUT being logged in
  const publicRoutes = [
    '/',                   // landing page (exact match)
    '/login',
    '/confirm',            // magic link confirm handler
    '/callback',           // Google OAuth callback
    '/error',
  ]

  // A variable that checks if the current pathname is a public route
  const isPublicRoute =
  // if the pathname is exactly '/' or if those publicRoutes(not including '/') are starting with the current pathname
  // then it will return true
  // why does that variable will return true ? cause of || or operator

  // why does not operator for "/"? cause we are using some method and startswith method
  //startsWith('/') matches everything /login, /dashboard etc
  // so, we have to stop it that's why used !== '/'
  // and handled it separately in or operator 

  // learn how does || operator works: "Happy if any one says Yes" rule.
  // if first say True then it will return true 
  // if first say fals then check second if it say true then return true
  // if both say false then return false

    request.nextUrl.pathname === '/' ||   // exact match for landing page
    publicRoutes.some(
      (route) => route !== '/' && request.nextUrl.pathname.startsWith(route)
    )

  // for logged-out user if he is logged-out then and on those pages then move to /login page
  if (!user && !isPublicRoute) {
    // then redirect to login page
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // If user IS logged in and trying to access landing page or login, send to dashboard
if (user && (request.nextUrl.pathname === '/' || request.nextUrl.pathname === '/login')) {
  const url = request.nextUrl.clone()
  url.pathname = '/dashboard'
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
