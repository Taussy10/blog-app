'use server'

import { createClient } from '@/lib/supabase/server'

export async function getBlogs() {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw new Error('Unauthorized')

    const { data: profile } = await supabase
        .from('profiles')
        .select('plan')
        .eq('user_id', user.id)
        .maybeSingle()

    return fetchBlogsWithFilter(supabase, profile?.plan || 'free')
}

async function fetchBlogsWithFilter(supabase: any, plan: string) {
    // 1. Fetch Blogs
    let query = supabase.from('blogs').select('*')
    if (plan === 'free') {
        query = query.eq('access_type', 'free')
    }
    const { data: blogs, error: blogsError } = await query.order('created_at', { ascending: false })
    if (blogsError) throw new Error('Could not fetch blogs')
    if (!blogs || blogs.length === 0) return []

    // 2. Fetch Profiles for these blogs manually
    const userIds = [...new Set(blogs.map((b: any) => b.user_id))]
    const { data: profiles, error: pError } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', userIds)

    if (pError) console.error('Manual profiles fetch error:', pError)

    // 3. Merge them in JS
    return blogs.map((blog: any) => ({
        ...blog,
        profiles: profiles?.find((p: any) => p.user_id === blog.user_id) || null
    }))
}

export async function getBlogById(id: string) {
    const supabase = await createClient()

    // 1. Fetch Blog
    const { data: blog, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('blog_id', id)
        .single()

    if (error || !blog) return null

    // 2. Fetch Profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('user_id', blog.user_id)
        .single()

    return { ...blog, profiles: profile }
}
