# Deployment and GitHub Push Guide

This guide provides step-by-step instructions to push your React application to a new public GitHub repository and deploy it on Vercel.

---

## Part 1: Create a New GitHub Repository

Since we want to push this project to a new repository on your profile (**https://github.com/Deepak-csengineer05**), follow these steps in your browser:

1. Open your browser and go to: **[https://github.com/new](https://github.com/new)**.
2. Ensure you are logged in to your account (`Deepak-csengineer05`).
3. Fill in the repository details:
   - **Repository owner**: `Deepak-csengineer05`
   - **Repository name**: `lunar-gift` (or any name you prefer, e.g., `birthday-gift`)
   - **Description**: (Optional) e.g., *A beautiful, interactive lunar-themed 3D birthday experience.*
   - **Visibility**: Select **Public** so anyone can access it.
   - **Initialize repository with**: Do **NOT** check any of the options (no README, no `.gitignore`, no license). Leave them all unchecked because we already have these files locally.
4. Click the green **Create repository** button.
5. Copy the HTTPS clone URL from the quick setup page (it will look like: `https://github.com/Deepak-csengineer05/lunar-gift.git`).

---

## Part 2: Push the Local Repository to your New GitHub Repo

Now that the new repository is created, we need to point your local repository to this new URL and push the committed code. 

I am ready to run these commands for you! Just send me the URL of your new repository in the chat (e.g., `https://github.com/Deepak-csengineer05/lunar-gift.git`), and I will execute the following steps:

1. **Rename branch to main** (if not already):
   ```bash
   git branch -M main
   ```
2. **Update the remote origin URL** to point to your new repo:
   ```bash
   git remote set-url origin <YOUR_NEW_REPO_URL>
   ```
3. **Push to the new repository**:
   ```bash
   git push -u origin main
   ```

*(Alternatively, you can run these commands yourself in your VS Code terminal or command prompt!)*

---

## Part 3: Deploy to Vercel

With your code safely on GitHub, deploying to Vercel takes less than two minutes:

1. Open your browser and go to **[https://vercel.com](https://vercel.com)**.
2. Sign up or log in using your **GitHub account**.
3. On the Vercel dashboard, click the **Add New...** button and select **Project**.
4. You will see a list of your GitHub repositories. Click **Import** next to your new repository (e.g., `lunar-gift`).
5. On the **Configure Project** screen, make sure you configure these critical settings:
   - **Framework Preset**: Select **Vite** (Vercel usually auto-detects this).
   - **Root Directory**: Click the **Edit** button next to the root directory and select the **`app`** folder. 
     > ⚠️ **IMPORTANT**: Your React application code is inside the `app/` subfolder, not the root of the repository. You must select `app` as the Root Directory for the build to succeed.
   - **Build and Output Settings**: Leave these as default (it will automatically run `npm run build` and look for the `dist` directory).
   - **Environment Variables**: If you have environment variables in your local `app/.env` file (such as your Supabase URL or keys), copy and paste them as Key-Value pairs under this section.
6. Click the **Deploy** button!
7. Once the build finishes, Vercel will give you a live, public URL (like `https://lunar-gift.vercel.app`) that you can share with anyone.

---

## Part 4: Updating the Code in the Future

Whenever you make new changes to the app and want to push them live:

1. **Commit your changes**:
   ```bash
   git add .
   git commit -m "Describe your changes here"
   ```
2. **Push to GitHub**:
   ```bash
   git push
   ```
3. **Automatic Deployment**: Vercel will automatically detect the push to your `main` branch, rebuild your app, and update your live website within seconds!
