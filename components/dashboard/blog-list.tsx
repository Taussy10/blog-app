'use client'

import { useQuery } from '@tanstack/react-query'
import { getBlogs } from '@/actions/blogs'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { format } from 'date-fns'
import { Lock, Unlock, Clock, User } from 'lucide-react'
import Link from 'next/link'

const extractExcerpt = (content: any) => {
    if (!content || typeof content !== 'object' || !content.blocks) return ""

    // Find the first paragraph block
    const paragraphBlock = content.blocks.find((block: any) => block.type === 'paragraph')

    if (paragraphBlock && paragraphBlock.data?.text) {
        // Strip HTML tags (Editor.js uses them for bold/italic)
        const cleanText = paragraphBlock.data.text.replace(/<[^>]*>?/gm, '')
        // Truncate to ~120 chars
        return cleanText.length > 120 ? cleanText.substring(0, 120) + "..." : cleanText
    }

    return "Click to read more about this post..."
}

export function BlogList() {
    const { data: blogs, isLoading, error } = useQuery({
        queryKey: ['blogs'],
        queryFn: () => getBlogs(),
    })

    if (isLoading) {
        return (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 p-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Card key={i} className="overflow-hidden border-none bg-card/50 backdrop-blur-sm">
                        <CardHeader className="space-y-2">
                            <Skeleton className="h-4 w-1/4" />
                            <Skeleton className="h-6 w-3/4" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-20 w-full" />
                        </CardContent>
                        <CardFooter>
                            <Skeleton className="h-4 w-1/2" />
                        </CardFooter>
                    </Card>
                ))}
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center">
                <div className="rounded-full bg-destructive/10 p-3 text-destructive mb-4">
                    <Lock className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold">Failed to load blogs</h3>
                <p className="text-muted-foreground max-w-xs mt-2">
                    {error instanceof Error ? error.message : "There was an error fetching the latest blogs."}
                </p>
            </div>
        )
    }

    if (!blogs || blogs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center">
                <div className="rounded-full bg-muted p-3 text-muted-foreground mb-4">
                    <Unlock className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold">No blogs found</h3>
                <p className="text-muted-foreground max-w-xs mt-2">
                    We couldn't find any blogs matching your access level.
                </p>
            </div>
        )
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 p-4">
            {blogs.map((blog: any) => (
                <Link key={blog.blog_id} href={`/dashboard/blog/${blog.blog_id}`}>
                    <Card className="group h-full overflow-hidden border-none bg-card/40 backdrop-blur-md hover:bg-card/60 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ring-1 ring-white/10 cursor-pointer">
                        <CardHeader className="p-5 pb-2">
                            <div className="flex justify-between items-start mb-2">
                                <Badge
                                    variant={blog.access_type === 'paid' ? 'default' : 'secondary'}
                                    className={`flex items-center gap-1.5 px-2.5 py-0.5 ${blog.access_type === 'paid' ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'}`}
                                >
                                    {blog.access_type === 'paid' ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                                    {blog.access_type === 'paid' ? 'Premium' : 'Free'}
                                </Badge>
                            </div>
                            <CardTitle className="line-clamp-2 text-xl font-bold tracking-tight group-hover:text-primary transition-colors">
                                {blog.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-5 pt-2">
                            <p className="text-muted-foreground line-clamp-3 text-sm leading-relaxed">
                                {extractExcerpt(blog.content)}
                            </p>
                        </CardContent>
                        <CardFooter className="p-5 pt-0 flex justify-between items-center text-xs text-muted-foreground mt-auto">
                            <div className="flex items-center gap-1.5">
                                <Clock className="h-3 w-3" />
                                {format(new Date(blog.created_at), 'MMM d, yyyy')}
                            </div>
                            <div className="flex items-center gap-1.5">
                                <User className="h-3 w-3" />
                                <span className="font-medium text-foreground/80">
                                    {blog.profiles?.full_name || (Array.isArray(blog.profiles) ? blog.profiles[0]?.full_name : 'Anonymous')}
                                </span>
                            </div>
                        </CardFooter>
                    </Card>
                </Link>
            ))}
        </div>
    )
}
