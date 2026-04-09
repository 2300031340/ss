## Supabase + Vercel Setup

### 1) Create the table in Supabase
- Open Supabase project SQL editor.
- Run the SQL from `supabase-schema.sql`.

### 2) Add environment variables (local)
- Copy `.env.example` to `.env`.
- Fill values:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

### 3) Add environment variables (Vercel)
- In Vercel project settings, open `Settings -> Environment Variables`.
- Add the same 2 variables:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- Apply to Production (and Preview if needed), then redeploy.

### 4) Deploy to Vercel
- Connect this repo/project in Vercel dashboard.
- Framework preset: `Vite`.
- Build command: `npm run build`.
- Output directory: `dist`.

### 5) Verify responses are stored
- Open deployed site and click through:
  - Enter button
  - Hidden message unlock
  - Deal button
  - Gift button
  - Playful choices
- In Supabase table `experience_responses`, confirm new rows appear.

### Notes
- Data is written client-side with the anon key and RLS insert policy.
- Client-side reads are blocked by policy in `supabase-schema.sql`.
