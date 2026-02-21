'use client';

import React from 'react';
import { OutputData } from '@editorjs/editorjs';

interface PreviewRendererProps {
    data: OutputData | undefined;
}

export const PreviewRenderer: React.FC<PreviewRendererProps> = ({ data }) => {
    if (!data || !data.blocks) return null;

    return (
        <div className="prose prose-stone dark:prose-invert max-w-none space-y-6">
            {data.blocks.map((block, index) => {
                const { type, data: blockData } = block;

                switch (type) {
                    case 'header':
                        const levels: Record<number, string> = {
                            1: 'text-4xl',
                            2: 'text-3xl',
                            3: 'text-2xl',
                            4: 'text-xl'
                        };
                        const headerClass = levels[blockData.level] || 'text-2xl';
                        return (
                            <div key={index} className={`font-bold tracking-tight text-foreground mt-6 mb-3 ${headerClass}`}>
                                {blockData.text}
                            </div>
                        );


                    case 'paragraph':
                        return (
                            <p
                                key={index}
                                className="text-lg leading-relaxed text-foreground/90"
                                dangerouslySetInnerHTML={{ __html: blockData.text }}
                            />
                        );

                    case 'list':
                        const ListTag = blockData.style === 'ordered' ? 'ol' : 'ul';
                        return (
                            <ListTag key={index} className="list-inside space-y-2 ml-4">
                                {blockData.items.map((item: string, i: number) => (
                                    <li key={i} className="text-lg" dangerouslySetInnerHTML={{ __html: item }} />
                                ))}
                            </ListTag>
                        );

                    case 'image':
                        return (
                            <figure key={index} className="my-8">
                                <img
                                    src={blockData.file.url}
                                    alt={blockData.caption || ''}
                                    className="rounded-lg border shadow-md w-full h-auto object-cover"
                                />
                                {blockData.caption && (
                                    <figcaption className="text-center text-sm text-muted-foreground mt-2 italic">
                                        {blockData.caption}
                                    </figcaption>
                                )}
                            </figure>
                        );

                    case 'code':
                        return (
                            <div key={index} className="my-6 rounded-md bg-muted p-4 font-mono text-sm overflow-x-auto border">
                                <pre><code>{blockData.code}</code></pre>
                            </div>
                        );

                    case 'quote':
                        return (
                            <blockquote key={index} className="border-l-4 border-primary pl-4 italic my-6 text-xl text-muted-foreground">
                                <p>{blockData.text}</p>
                                {blockData.caption && <cite className="text-sm block mt-2">— {blockData.caption}</cite>}
                            </blockquote>
                        );

                    case 'checklist':
                        return (
                            <div key={index} className="space-y-2">
                                {blockData.items.map((item: any, i: number) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className={`w-5 h-5 border rounded flex items-center justify-center ${item.checked ? 'bg-primary border-primary' : 'bg-background'}`}>
                                            {item.checked && <span className="text-white text-xs">✓</span>}
                                        </div>
                                        <span className={item.checked ? 'line-through text-muted-foreground' : ''}>
                                            {item.text}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        );

                    default:
                        console.warn(`Unknown block type: ${type}`);
                        return null;
                }
            })}
        </div>
    );
};
