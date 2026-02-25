import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BlogEditor } from "@/components/editor/blog-editor";
import { LogoutButton } from '@/components/logout-button';
import { BlogList } from '@/components/dashboard/blog-list';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default async function ProtectedPage() {
  const supabase = await createClient()

  // if there is no user, redirect to login page
  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/login')
  }
// console.log("user :",data);

  return (
    <main className="min-h-screen bg-muted/30 pb-20">
      <div className="max-w-7xl mx-auto px-4 pt-10">
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-foreground">
              Your Dashboard
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Welcome back, <span className="text-primary font-medium">{data.user.user_metadata.full_name}</span>. Explore the latest blogs.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard/editor">
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Blog
              </Button>
            </Link>
            <LogoutButton />
          </div>
        </div>

        <div className="grid gap-10">
          <section className="relative">
            <div className="absolute inset-0 bg-linear-to-tr from-primary/5 via-transparent to-primary/5 blur-3xl -z-10" />
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold tracking-tight">Recent Blogs</h2>
            </div>
            <BlogList />
          </section>
        </div>
      </div>
    </main>
  );
}