import { getBlogById } from "@/actions/blogs";
import { notFound } from "next/navigation";
import { PreviewRenderer } from "@/components/editor/preview-renderer";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Clock, User, ChevronLeft, Lock, Unlock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function BlogPage({ params }: { params: { id: string } }) {
    const { id } = await params;
    const blog = await getBlogById(id);

    if (!blog) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-background pb-20">
            {/* Navigation Header */}
            <div className="border-b bg-card/50 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="sm" className="gap-2">
                            <ChevronLeft className="h-4 w-4" />
                            Back to Dashboard
                        </Button>
                    </Link>
                    <Badge
                        variant={blog.access_type === 'paid' ? 'default' : 'secondary'}
                        className={`gap-1.5 ${blog.access_type === 'paid' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}
                    >
                        {blog.access_type === 'paid' ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                        {blog.access_type === 'paid' ? 'Premium Content' : 'Free Content'}
                    </Badge>
                </div>
            </div>

            <article className="max-w-4xl mx-auto px-4 pt-12">
                {/* Blog Header */}
                <header className="space-y-6 mb-12">
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight text-foreground leading-tight">
                        {blog.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground border-y py-6 border-primary/10">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                {blog.profiles?.full_name?.charAt(0) || <User className="h-5 w-5" />}
                            </div>
                            <div>
                                <p className="text-foreground font-semibold line-clamp-1">
                                    {blog.profiles?.full_name || 'Anonymous Writer'}
                                </p>
                                <p className="text-xs uppercase tracking-wider font-medium opacity-70">Author</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-primary" />
                            <span>Published on {format(new Date(blog.created_at), 'MMMM d, yyyy')}</span>
                        </div>

                        <div className="text-primary font-medium px-3 py-1 bg-primary/5 rounded-full">
                            {blog.access_type === 'paid' ? '💎 Premium' : '🔓 Public'}
                        </div>
                    </div>
                </header>

                {/* Blog Content */}
                <div className="prose prose-slate dark:prose-invert max-w-none min-h-[500px]">
                    <PreviewRenderer data={blog.content} />
                </div>

                {/* Footer Gradient */}
                <div className="mt-20 pt-10 border-t border-primary/10 text-center">
                    <p className="text-muted-foreground mb-6">Thanks for reading! Check out more blogs in your dashboard.</p>
                    <Link href="/dashboard">
                        <Button variant="outline" className="rounded-full px-8 hover:bg-primary hover:text-primary-foreground transition-all">
                            Explore More Posts
                        </Button>
                    </Link>
                </div>
            </article>
        </main>
    );
}
