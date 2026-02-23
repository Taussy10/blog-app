import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * What we are doing here our server to supabase server communication
 * our server(with taking cookies) request to Supabase bro get me this image
 * Ok, supabase asks are you authenticated ? our server says yeah, see JWT 
 * by this it by pass the RLS and now it can download images from bucket 
 * 
 * Now question is here we are dealing with private buckets: 
 * 1. how does it getting image-token
 * 2. Won't the image expire in certain time ?   
 * 
 * Server doesn't take take image-link from supabase cause it will have token +expiry time
 * instead it download binary data of image
 * what's binary data of an image ? in computer everything is stored as binary form(0s and 1s) so, 
 * image is also stored as binary data so, that's data 
 * 
 * can we see that binary data ?
 *   
 * 
 * Then server will give that binary data to the browser 
 * browser thinks it's local image so, it shows it 
 * 
 * Analogy
 * Signed URL: Dukandaar ne aapko ek Time-limited Coupon diya. Aap line mein khade hue, coupon dikhaya aur saman liya. 
 * Coupon expire toh saman nahi milega.
 * 
Proxy Download: Aap mujhse (Proxy) kahte ho ki saman chahiye.
 Main (Server) dukaan ke andar jata hoon (kyunki mere paas permission hai), saman khareed kar bahar 
aa jata hoon (Download), aur saman aapke hath mein thama deta hoon.
 * 
 *  
 * Actually private buckets don't allow to access unless you have access token also it expires after certain time(max 1 year)
 * You know that we store images in private buckets and public buckets and both are works fine 
 * but diff is getting the images from public and private buckets 
 * Public: easy not gonna talk about that 
 * Private: you need signed url to access the image and it expires after certain time(max 1 year)
 * 
 * We don't want that token should expire after certain time(max 1 year) and are app will break
 * So, we created a proxy(Something that bypass rules and allow to access the image)
 * It will download the image from private bucket and return it to the user
 * 
 * Actually we are communincating from our server to supabase server and downloading the image from private bucket
 * so, supabase gave permission to our server to download the image from private bucket
 * 
 * This API route acts as a secure proxy to serve images from private Supabase buckets.
 * It checks for an active session and uses Supabase RLS to determine if the user can access the file.
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const bucket = searchParams.get("bucket");
        const path = searchParams.get("path");

        if (!bucket || !path) {
            return new NextResponse("Missing bucket or path", { status: 400 });
        }

        const supabase = await createClient();

        // 1. Check if authenticated (This ensures only logged-in users can use the proxy)
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            return new NextResponse("Unauthorized - Please log in to view this image", { status: 401 });
        }

        // 2. Download the file from Supabase Storage
        // Supabase will automatically enforce the RLS policies you set in the dashboard
        const { data, error } = await supabase.storage.from(bucket).download(path);
        
        if (error) {
            console.error("Storage Proxy Error:", error.message);
            return new NextResponse(`Error fetching image: ${error.message}`, { status: 404 });
        }

        if (!data) {
            return new NextResponse("Image data is empty", { status: 404 });
        }
     console.log(data)
        // 3. Return the image data with the correct content type
        return new NextResponse(data, {
            headers: {
                "Content-Type": data.type || "image/png",
                "Cache-Control": "private, max-age=3600", // Cache for 1 hour for the user
            },
        });
    } catch (err: any) {
        console.error("Proxy System Error:", err);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
