import { BlogEditor } from "@/components/editor/blog-editor";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function EditorPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    return (
        <main className="min-h-screen bg-background">
            <BlogEditor />
        </main>
    );
}
