# Deployment Guide

## Phase 1: Supabase (Database & Auth)

1.  **Create Project**: Go to [database.new](https://database.new) and create a new project.
2.  **Run SQL**: 
    *   Go to the **SQL Editor** in the left sidebar.
    *   Copy the content from `supabase/schema.sql` in this project.
    *   Paste it into the editor and click **Run**.
3.  **Get Credentials**:
    *   Go to **Project Settings** -> **API**.
    *   Copy the `Project URL` and `anon` (public) key.

## Phase 2: Vercel (Hosting)

1.  **Push Code**: Ensure this code is pushed to a Git repository (GitHub/GitLab).
2.  **Create Project**: Go to [Vercel Dashboard](https://vercel.com/new).
3.  **Import**: Select your repository.
4.  **Environment Variables**:
    *   Add the following variables:
        *   `API_KEY`: Your Gemini API Key.
        *   `VITE_SUPABASE_URL`: The Project URL from Phase 1.
        *   `VITE_SUPABASE_ANON_KEY`: The Anon Key from Phase 1.
5.  **Deploy**: Click **Deploy**.

## Phase 3: Connect Code (Refactoring)

Currently, the app uses `localStorage` for demo purposes. To switch to Supabase:

1.  Install the client: `npm install @supabase/supabase-js`
2.  Create `services/supabase.ts`:
    ```ts
    import { createClient } from '@supabase/supabase-js'

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

    export const supabase = createClient(supabaseUrl, supabaseKey)
    ```
3.  Update `AuthContext.tsx` to use `supabase.auth.signUp()` instead of `localStorage`.
4.  Update `DocumentVault.tsx` to upload to Supabase Storage instead of local state.
