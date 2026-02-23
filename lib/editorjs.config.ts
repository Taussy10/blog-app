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
const getEditorConfig = (accessType: 'free' | 'paid') => ({
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
            // How does we are storing the Image

            // 1. when you upload images from local device then it will upload to supabase storage
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

                        // Use the accessType from the editor settings to decide the bucket
                        const bucketName = accessType === 'paid' ? 'blog-images-paid' : 'blog-images-free';

                        // 2. Construct path: [user_id]/[timestamp]-[filename]
                        // RLS requires the first folder to be the user's ID
                        const fileExt = file.name.split('.').pop();
                        // why data.now ? cause we want to make sure that the file name is unique
                        const fileName = `${Date.now()}.${fileExt}`;
                        const filePath = `${user.id}/${fileName}`;

                        // 3. Upload to the determined bucket
                        const { data, error: uploadError } = await supabase.storage
                            .from(bucketName)
                            .upload(filePath, file);

                        if (uploadError) throw uploadError;

                        // 4. Get the correct URL for the editor
                        let imageUrl = "";
                        if (bucketName === "blog-images-paid") {
                            // If it's a private bucket, use our secure proxy API
                            // so, this link we are gonna store it in our database
                            // this data nees two things: API key and base URL 
                            // whenever will request browser will create give base URL:  http://localhost:3000/
                            // btw in production base URL will be your domain:
                            // API key we can get it from cookies whenever we will request this 
                            // API route(then server will give the  JWT from cookies) 

                            // here is how it will look like: http://localhost:3000/api/storage/proxy?bucket=blog-images-paid&path=7edf2bc0-9adb-4fc8-9a2b-efd375692da4%2F1771866076029.png
                            // We will use server creating link

                            imageUrl = `/api/storage/proxy?bucket=${bucketName}&path=${encodeURIComponent(filePath)}`;
                        } else {
                            // If it's public, just get the standard public URL
                            const { data: { publicUrl } } = supabase.storage
                                .from(bucketName)
                                .getPublicUrl(filePath);
                            imageUrl = publicUrl;
                        }

                        return {
                            success: 1,
                            file: {
                                url: imageUrl,
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
})

export { getEditorConfig }

