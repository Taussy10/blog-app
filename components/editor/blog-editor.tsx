'use client';

import React, { useState } from "react";
import Editor from "./editor-component";
import { PreviewRenderer } from "./preview-renderer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OutputData } from "@editorjs/editorjs";
import { toast } from "sonner";
import { Loader2, Save, Eye, ChevronLeft } from "lucide-react";

export function BlogEditor() {
    const [title, setTitle] = useState("");
    const [data, setData] = useState<OutputData | undefined>(undefined);
    const [isSaving, setIsSaving] = useState(false);
    const [isPreview, setIsPreview] = useState(false);

    const handleSave = async () => {
        // ... same saving logic ...
        if (!title) { toast.error("Please enter a title"); return; }
        if (!data || data.blocks.length === 0) { toast.error("Content empty"); return; }

        setIsSaving(true);
        try {
            console.log("Saving...", data);
            await new Promise(r => setTimeout(r, 1000));
            toast.success("Blog saved (simulated)");
        } catch (e) {
            toast.error("Save failed");
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
                        <PreviewRenderer data={data} />
                    </div>

                    <div className="mt-16 p-8 bg-muted/50 rounded-2xl border-2 border-dashed border-primary/20">
                        <h4 className="text-sm font-bold uppercase tracking-widest text-primary mb-4">Under the hood (JSON)</h4>
                        <pre className="text-xs font-mono bg-black text-green-400 p-4 rounded-xl overflow-auto max-h-[300px] shadow-2xl">
                            {JSON.stringify(data, null, 2)}
                        </pre>
                    </div>
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
                        </CardContent>
                    </Card>

                    <div className="space-y-4 bg-card border rounded-2xl p-4 shadow-lg min-h-[600px]">
                        <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground px-4">Content Editor</Label>
                        <div className="relative">
                            <Editor
                                holder="editorjs-container"
                                data={data}
                                onChange={setData}
                            />
                        </div>
                    </div>
                </div>
            )}

            <footer className="pt-20 pb-10 flex flex-col items-center gap-4 border-t opacity-50">
                <p className="text-xs font-mono lowercase tracking-tighter">
                    Powered by Editor.js • Next.js • Supabase
                </p>
            </footer>
        </div>
    );
}
