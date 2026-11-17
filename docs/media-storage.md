# NetFilms media storage — Cloudflare R2

The FastAPI service creates short-lived presigned PUT URLs. The browser uploads directly to Cloudflare R2; the R2 secret access key is never sent to the frontend. After upload, the API verifies the stored object's size and content type and creates the corresponding Supabase `media_assets` and `movie_media` / `episode_media` records using the signed-in administrator's Supabase session.

## 1. Create the bucket and API token

1. In Cloudflare, create an R2 bucket named `netfilms-media` (or set `R2_BUCKET_NAME` to your chosen name).
2. Create an R2 API token scoped to this bucket with Object Read and Object Write permissions.
3. Copy the Account ID, Access Key ID and Secret Access Key into the backend host's environment settings only.
4. If you want browser playback from a public bucket/custom domain, configure an R2 custom domain and set `R2_PUBLIC_BASE_URL`. Do not enable public access unless the rights holder has authorized public streaming.

## 2. Backend environment

Set these variables for the FastAPI service:

- `SUPABASE_URL` — NetFilms Supabase project URL
- `SUPABASE_ANON_KEY` — Supabase publishable key (or legacy anon key)
- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`
- `R2_PUBLIC_BASE_URL` — optional, without a trailing slash
- `UPLOAD_MAX_BYTES` — defaults to 2,000,000,000 (2 GB)
- `FRONTEND_ORIGINS` — exact frontend origin(s), comma-separated

Never set the R2 secret or any Supabase service-role key in a `NEXT_PUBLIC_*` variable.

## 3. Configure bucket CORS

Add a CORS rule to the R2 bucket. Replace the example origin with the exact NetFilms frontend origin(s):

```json
[
  {
    "AllowedOrigins": ["http://localhost:3000", "https://YOUR-NETFILMS-DOMAIN"],
    "AllowedMethods": ["PUT", "GET", "HEAD"],
    "AllowedHeaders": ["Content-Type", "ETag"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

The local development origin can be removed in production. CORS is required because the browser uploads directly to R2.

## 4. Upload flow

1. An active owner, content manager or editor requests a signed upload URL.
2. The API validates the Supabase user session, role, media type and declared size.
3. The browser uploads the file directly to R2 using the signed URL.
4. The API checks the uploaded object in R2 and attaches its metadata to the selected movie or episode in Supabase.

The current upload limit is 2 GB per file. Larger movie files require a multipart upload workflow and are not enabled yet. Uploading media does not publish a movie; translator credits and distribution-rights verification remain mandatory.
