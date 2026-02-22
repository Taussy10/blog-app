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
// WHy from client ? cause Editor JS is client side library
import { createClient } from "@/lib/supabase/client";

// It's a control center(from where we can control the editor)
// so, here we are going to add all the tools we want to use in the editor
// also funciton if we want to add files in supabase storage
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
                        const supabase = createClient();

                        // 1. Get current user for RLS (Need this for the folder name)
                        const { data: { user }, error: userError } = await supabase.auth.getUser();
                        console.log("USER", user?.id);
                        if (userError || !user) {
                            throw new Error("You must be logged in to upload images");
                        }

                        // 2. Construct path: [user_id]/[timestamp]-[filename]
                        // RLS requires the first folder to be the user's ID
                        const fileExt = file.name.split('.').pop();
                        // why data.now ? cause we want to make sure that the file name is unique
                        const fileName = `${Date.now()}.${fileExt}`;
                        const filePath = `${user.id}/${fileName}`;

                        // 3. Upload to 'images' bucket
                        const { data, error: uploadError } = await supabase.storage
                            .from('images')
                            .upload(filePath, file);

                        if (uploadError) throw uploadError;

                        // 4. Get Public URL so Editor.js can display the image
                        const { data: { publicUrl } } = supabase.storage
                            .from('images')
                            .getPublicUrl(filePath);

                        return {
                            success: 1,
                            file: {
                                url: publicUrl,
                            }
                        };

                    } catch (error: any) {
                        console.error("Image upload failed:", error.message);
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

