# NetFilms launch checklist

- [ ] Replace demo catalogue entries with content authorized for distribution.
- [ ] Ensure each published movie and episode has at least one translator credit.
- [ ] Create Supabase project and apply the reviewed migration.
- [ ] Configure Supabase Auth and assign admin roles only through trusted server-side tooling.
- [ ] Create private Cloudflare R2 buckets and apply the least-privilege CORS policy in `docs/r2-cors-policy.example.json` with exact production origins.
- [ ] Verify browser PUT uploads, signed GET playback, WebVTT CORS headers, and caption selection using an authorized test episode.
- [ ] Implement short-lived signed upload and playback URLs in the API.
- [ ] Configure environment variables in frontend and API hosting.
- [ ] Configure domain, HTTPS, monitoring, backups and restore procedure.
- [ ] Test mobile UX, accessibility, authorization, RLS and playback.

Never expose Supabase service-role keys or R2 credentials in browser code. Never publish unlicensed films or permanent signed media URLs.
