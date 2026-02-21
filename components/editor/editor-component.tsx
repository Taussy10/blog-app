'use client';

import React, { useEffect, useRef, useState } from "react";
import EditorJS, { OutputData } from "@editorjs/editorjs";
import { EDITOR_CONFIG } from "../../lib/editorjs.config";

interface EditorProps {
  data?: OutputData;
  onChange?: (data: OutputData) => void;
  holder: string;
}

const Editor: React.FC<EditorProps> = ({ data, onChange, holder }) => {
  const editorInstance = useRef<EditorJS | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const initEditor = async () => {
      if (!editorInstance.current) {
        const editor = new EditorJS({
          holder: holder,
          tools: EDITOR_CONFIG as any,
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
  }, [isMounted, holder]); // Added holder to dependencies

  if (!isMounted) return null;

  return (
    <div
      id={holder}
      className="prose prose-stone dark:prose-invert max-w-none min-h-[500px] w-full bg-background border rounded-lg p-6 shadow-sm"
    />
  );
}

export default Editor;
