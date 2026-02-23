# Multi-Bucket Storage Implementation Guide

This project uses a dual-bucket strategy to manage image assets based on the blog's access level (**FREE** vs **PAID**). This document explains how we solved the challenge of serving private images securely without using expiring links.

## 1. Storage Buckets Structure

We have two distinct buckets in Supabase Storage:

| Bucket Name | Access Level | Description |
| :--- | :--- | :--- |
| `blog-images-free` | **Public** | Images are accessible via public URLs. Used for free blogs. |
| `blog-images-paid` | **Private** | Images are restricted. Direct URL access results in `403 Forbidden`. Used for paid blogs. |

## 2. Dynamic Bucket Selection

The choice of bucket is determined in the `BlogEditor` component when the user toggles the **Access Level**.

- In `lib/editorjs.config.ts`, we use a function `getEditorConfig(accessType)` that injects the current access level into the Editor.js uploader.
- The uploader automatically routes the file to the correct bucket:
  ```typescript
  const bucketName = accessType === 'paid' ? 'blog-images-paid' : 'blog-images-free';
  ```

## 3. The Challenge: Private Image Access

By default, private bucket images require a **Signed URL** to view. However:
- **Signed URLs expire** (e.g., after 5 minutes). 
- If we saved a signed URL in the blog's JSON content, the images would break as soon as the token expired.
- Refreshing tokens every time a blog is viewed adds heavy overhead.

## 4. The Solution: Secure Storage Proxy

We implemented a custom API route that acts as a secure bridge between the browser and the private storage.

### How it works:
1. **The Proxy Route**: `app/api/storage/proxy/route.ts`
   - When a request comes to `/api/storage/proxy`, the server first checks if the user is **authenticated** via Supabase Auth.
   - If authenticated, the server uses the Supabase Admin/Server client to download the image directly from the private bucket.
   - The server then streams that image data back to the browser with the correct headers (MIME type).

2. **The Editor URL**:
   - Instead of a public Supabase URL, the editor stores a local relative path:
     `url: "/api/storage/proxy?bucket=blog-images-paid&path=user_id/image.png"`
   - This URL is **permanent** and **secure**.

### Security Benefits:
- **No Expiration**: Unlike signed URLs, this link will work as long as the user has permission to see it.
- **Authentication Locked**: Unlike public buckets, if a non-logged-in user tries to visit the proxy link, they get a `401 Unauthorized` error.
- **RLS Integration**: The proxy respects your Supabase RLS policies. Even if a user is logged in, they can only see files they are authorized to see.

---

## Technical Summary
- **Frontend**: `BlogEditor` toggles state ➡ `EditorComponent` refreshes with new config.
- **Logic**: `editorjs.config.ts` computes bucket name based on toggle.
- **Backend**: `route.ts` (API) performs the secure download and relay.
