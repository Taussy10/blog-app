// This is how you can ignore the typescript unwanted errors
// @ts-ignore
import CheckList from "@editorjs/checklist";
import Code from "@editorjs/code";
// @ts-ignore
import Embed from "@editorjs/embed";
import InlineCode from "@editorjs/inline-code";
// @ts-ignore
import Hyperlink from "editorjs-hyperlink";
import List from "@editorjs/list";
import Quote from "@editorjs/quote";
import Paragraph from "@editorjs/paragraph";
import Header from "@editorjs/header";
import Image from '@editorjs/image';

const EDITOR_CONFIG = {
    code: Code,
    header: {
        class: Header,
        config: {
            placeholder: 'Enter a Heading',
            levels: [2, 3, 4],
            defaultLevel: 2
        },
        inlineToolbar: true
    },
    hyperlink: {
        class: Hyperlink,
        config: {
            shortcut: 'CMD+L',
            target: '_blank',
            rel: 'nofollow',
            availableTargets: ['_blank', '_self'],
            availableRels: ['author', 'noreferrer'],
            validate: false,
        }
    },
    paragraph: {
        class: Paragraph,
        inlineToolbar: true
    },
    image: {
        class: Image,
        config: {
            uploader: {
                uploadByFile: async (file: File) => {
                    try {
                        // In a real app, you'd upload to Supabase Storage here
                        // For now, we'll use a local blob URL
                        const url = URL.createObjectURL(file);
                        return {
                            success: 1,
                            file: {
                                url: url,
                            }
                        };
                    } catch (error) {
                        console.error("Image upload failed", error);
                        return {
                            success: 0,
                        };
                    }
                }
            }
        }
    },
    checklist: {
        class: CheckList,
        inlineToolbar: true,
    },
    embed: Embed,
    inlineCode: InlineCode,
    list: {
        class: List,
        inlineToolbar: true,
    },
    quote: {
        class: Quote,
        inlineToolbar: true,
    },
}

export { EDITOR_CONFIG }

