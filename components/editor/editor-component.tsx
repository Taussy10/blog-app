'use client';

import React, { useEffect, useRef, useState } from "react";
import type EditorJS from "@editorjs/editorjs";
import type { OutputData } from "@editorjs/editorjs";
import { getEditorConfig } from "../../lib/editorjs.config";

interface EditorProps {
  data?: OutputData;
  onChange?: (data: OutputData) => void;
  holder: string;
  accessType: "free" | "paid";
}
// This component is used to render the editor in the editor component -> by getting data from blog-editor.tsx

const Editor: React.FC<EditorProps> = ({ data, onChange, holder, accessType }) => {
  const editorInstance = useRef<EditorJS | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const initEditor = async () => {
      // type safety related
      const EditorJS = (await import("@editorjs/editorjs")).default;
      if (!editorInstance.current) {
        const editor = new EditorJS({
          holder: holder,
          tools: getEditorConfig(accessType) as any,
          placeholder: 'Start writing your amazing story...',
          data: data,
          async onChange(api) {
            const savedData = await api.saver.save();
            if (onChange) {
              onChange(savedData);
            }
          },
          onReady: () => {
            console.log('Editor.js is ready to work!');
            editorInstance.current = editor;
          },
          autofocus: true,
        });
      }
    };

    initEditor();

    return () => {
      if (editorInstance.current) {
        editorInstance.current.destroy();
        editorInstance.current = null;
      }
    };
  }, [isMounted, holder, accessType]); // Added accessType to dependencies

  if (!isMounted) return null;

  return (
    <div
      id={holder}
      className="prose prose-stone dark:prose-invert max-w-none min-h-[500px] w-full bg-background border rounded-lg p-6 shadow-sm"
    />
  );
}

export default Editor;
