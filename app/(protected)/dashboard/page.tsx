import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BlogEditor } from "@/components/editor/blog-editor";
import { LogoutButton } from '@/components/logout-button';

export default async function ProtectedPage() {
  const supabase = await createClient()

  // if there is no user, redirect to login page
  const { data, error } = await supabase.auth.getClaims()
  if (error || !data?.claims) {
    redirect('/login')
  }

  return (
    <main className="min-h-screen bg-muted/30">
      <BlogEditor />
      <LogoutButton/>
    </main>
  );
}