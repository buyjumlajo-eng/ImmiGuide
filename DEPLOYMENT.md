
# Deployment Guide

## Phase 1: Supabase (Database & Auth)

1.  **Create Project**: Go to [database.new](https://database.new) and create a new project.
2.  **Run SQL**: 
    *   Go to the **SQL Editor** in the left sidebar.
    *   Copy the content from `SUPABASE_SCHEMA.sql` in this project.
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
        *   `GEMINI_API_KEY`: Your Gemini API Key.
        *   `VITE_SUPABASE_URL`: The Project URL from Phase 1.
        *   `VITE_SUPABASE_ANON_KEY`: The Anon Key from Phase 1.
        *   `POSTHOG_API_KEY`: (Optional) Your PostHog Project API Key
        *   `POSTHOG_HOST`: (Optional) e.g., `https://us.i.posthog.com`
        *   `SENTRY_DSN`: (Optional) Your Sentry DSN
5.  **Deploy**: Click **Deploy**.

## Phase 3: Troubleshooting "Empty White Page"

If you see an empty white page after deployment:
1. **Check Environment Variables:** Ensure all required environment variables (especially `GEMINI_API_KEY`) are correctly set in Vercel.
2. **Check Browser Console:** Open the developer tools in your browser (F12) and check the Console tab for any JavaScript errors.
3. **Check Vercel Logs:** Go to your Vercel project dashboard, click on the deployment, and check the "Logs" tab for any build or runtime errors.
4. **Supabase Connection:** If the app loads but data is missing, ensure your Supabase URL and Anon Key are correct. The app will fallback to local storage if it cannot connect to Supabase.

## Option A: Starting from Scratch (Local PC)

If you have just downloaded these files to your computer and want to upload them to a NEW GitHub repository:

1.  **Open Terminal** in your project folder.
2.  **Initialize Git**:
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    ```
3.  **Connect to GitHub**:
    *   Create a new empty repository on GitHub.
    *   Run these commands (replace URL with your new repo URL):
    ```bash
    git branch -M main
    git remote add origin https://github.com/YOUR_NEW_USERNAME/YOUR_NEW_REPO.git
    git push -u origin main
    ```

## Option B: Switching GitHub Accounts (Existing Repo)

If you already have this project connected to an old GitHub account and want to switch to a new one:

1.  **Check current link**:
    ```bash
    git remote -v
    ```
2.  **Remove old link**:
    ```bash
    git remote remove origin
    ```
3.  **Add new link**:
    ```bash
    git remote add origin https://github.com/YOUR_NEW_USERNAME/YOUR_NEW_REPO.git
    ```
4.  **Push code**:
    ```bash
    git push -u origin main
    ```
