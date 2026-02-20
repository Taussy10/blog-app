
// Intialize supabase client

// it can be imported via two ways: supbase/supbase-js
// which works in both client and server(but doesn't deal with cookies so, have to use supabase/ssr when work on server side)
// downsides:
// It does NOT automatically integrate with Next.js cookies

// It does NOT handle SSR auth properly

// It won’t sync sessions between server and browser

// and other is supabase/ssr
// which works only in server AND HELP IN server side rendering 
// and cookie based authentication
// Will use when we work with Supabase
// https://supabase.com/docs/guides/auth/server-side/creating-a-client

// In nextJS we work with Client and Server so, have two create two supabase client files
// one for client and one for server

// and use supabase/ssr cause it will handle both client and server side rendering(with cookies that won't do supabase/supabase-js)

// import {createClient} from '@supabase/supabase-js'
// change it
import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_ANON_KEY!
    )
}
