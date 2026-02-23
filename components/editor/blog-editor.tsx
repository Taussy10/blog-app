'use client';

import React, { useState } from "react";
import dynamic from "next/dynamic";
// In NextJS components are pre-rendered(firstly render on server) on the server where these globals(document, window) don't exist,
// leading to that crash during the "module evaluation" phase.
// now by ssr: false it won't render on the server
const Editor = dynamic(() => import("./editor-component"), { ssr: false });
import { PreviewRenderer } from "./preview-renderer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { OutputData } from "@editorjs/editorjs";
import { toast } from "sonner";
import { Loader2, Save, Eye, ChevronLeft } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

// have to use client cause editor.js is client side lib
import { createClient } from "@/lib/supabase/client";
export function BlogEditor() {
    const [title, setTitle] = useState("");
    // storing the data of editor
    const [blogContent, setBlogContent] = useState<OutputData | undefined>(undefined);
    const [isSaving, setIsSaving] = useState(false);
    const [isPreview, setIsPreview] = useState(false);
    const [blogId, setBlogId] = useState<string | null>(null);
    const [accessType, setAccessType] = useState<"free" | "paid">("free");
    const queryClient = useQueryClient();

    const supabase = createClient();
    const knowUser = async () => {
        const { data: user } = await supabase.auth.getUser();
        console.log(user);
    }
    const handleSave = async () => {
        if (!title) { toast.error("Please enter a title"); return; }
        if (!blogContent || blogContent.blocks.length === 0) { toast.error("Content empty"); return; }

        setIsSaving(true);
        try {
            // Get current logged in user 
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError || !user) {
                toast.error("You are not logged in");
                return;
            }

            // What does UPSERT do? If blogId exists, it updates. If not, it inserts based on primary-key/unique -> blog_id
            const { data: blog, error } = await supabase
                .from('blogs')
                .upsert({
                    blog_id: blogId || undefined, // Use blog_id as the primary key name
                    title: title,
                    content: blogContent,
                    user_id: user.id,
                    access_type: accessType,
                })
                .select()
                .single();

            if (error) {
                toast.error(`Error: ${error.message}`);
                console.error("Supabase Error:", error);
                return;
            }

            // Update state with the saved blog ID so next save is an update
            if (blog) {
                setBlogId(blog.blog_id); // Use blog_id from the returned data
                queryClient.invalidateQueries({ queryKey: ['blogs'] });
                console.log("Blog saved/updated successfully:", blog);
                toast.success(blogId ? "Blog updated!" : "Blog created!");
            }

        } catch (e) {
            console.error("System Error:", e);
            toast.error("An unexpected error occurred.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="container mx-auto py-10 px-4 max-w-4xl space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        {isPreview ? "Previewing Blog" : "Create New Blog"}
                    </h1>
                    <p className="text-muted-foreground mt-2 font-medium">
                        {isPreview ? "Seeing how it looks for your audience." : "Craft your next masterpiece."}
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant={isPreview ? "default" : "outline"}
                        onClick={() => setIsPreview(!isPreview)}
                        className="flex gap-2 transition-all"
                    >
                        {isPreview ? <ChevronLeft className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        {isPreview ? "Back to Editor" : "Live Preview"}
                    </Button>
                    {!isPreview && (
                        <Button onClick={handleSave} disabled={isSaving} className="flex gap-2">
                            {isSaving ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Save className="w-4 h-4" />
                            )}
                            {isSaving ? "Saving..." : "Save Blog"}
                        </Button>
                    )}
                </div>
            </div>

            {isPreview ? (
                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <header className="space-y-6">
                        <h1 className="text-5xl font-black leading-tight text-foreground">{title || "Untitled Blog"}</h1>
                    </header>

                    <div className="min-h-[400px]">
                        <PreviewRenderer data={blogContent} />
                    </div>

                    {/* <div className="mt-16 p-8 bg-muted/50 rounded-2xl border-2 border-dashed border-primary/20">
                        <h4 className="text-sm font-bold uppercase tracking-widest text-primary mb-4">Under the hood (JSON)</h4>
                        <pre className="text-xs font-mono bg-black text-green-400 p-4 rounded-xl overflow-auto max-h-[300px] shadow-2xl">
                            {JSON.stringify(data, null, 2)}
                        </pre>
                    </div> */}
                </div>
            ) : (
                <div className="space-y-8 animate-in fade-in duration-500">
                    <Card className="border shadow-xl bg-card/50 backdrop-blur-xl border-primary/10">
                        <CardHeader>
                            <CardTitle className="text-xl font-bold">Blog Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Full Title</Label>
                                <Input
                                    id="title"
                                    placeholder="The Future of Web Development..."
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="text-xl font-bold py-8 px-6 bg-background/50 border-2 focus-visible:ring-primary shadow-inner"
                                />
                            </div>

                            <div className="space-y-3">
                                <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Access Level</Label>
                                <div className="flex bg-muted/30 p-1.5 rounded-2xl border-2 border-primary/5 w-full sm:w-fit backdrop-blur-sm">
                                    <button
                                        type="button"
                                        onClick={() => setAccessType('free')}
                                        className={`flex-1 sm:flex-none px-10 py-2.5 rounded-xl text-sm font-black transition-all duration-300 ${accessType === 'free'
                                            ? 'bg-background shadow-[0_8px_30px_rgb(0,0,0,0.12)] text-primary scale-100'
                                            : 'text-muted-foreground/60 hover:text-foreground hover:bg-background/40 scale-95'
                                            }`}
                                    >
                                        FREE
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setAccessType('paid')}
                                        className={`flex-1 sm:flex-none px-10 py-2.5 rounded-xl text-sm font-black transition-all duration-300 ${accessType === 'paid'
                                            ? 'bg-background shadow-[0_8px_30px_rgb(0,0,0,0.12)] text-primary scale-100'
                                            : 'text-muted-foreground/60 hover:text-foreground hover:bg-background/40 scale-95'
                                            }`}
                                    >
                                        PAID
                                    </button>
                                </div>
                                <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.2em] px-1">
                                    {accessType === 'free' ? '🔓 Accessible to everyone' : '💎 Requires active subscription'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-4 bg-card border rounded-2xl p-4 shadow-lg min-h-[600px]">
                        <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground px-4">Content Editor</Label>
                        <div className="relative">
                            <Editor
                                holder="editorjs-container"
                                data={blogContent}
                                onChange={setBlogContent}
                                accessType={accessType}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
