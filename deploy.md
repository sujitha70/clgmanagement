# 🚀 CampusResolve — Production Deployment Guide

This guide walks you through deploying **CampusResolve** to production using:
- **Backend API & WebSockets**: [Render.com](https://render.com) (Free Node.js Web Service)
- **Frontend Web Portal**: [Vercel.com](https://vercel.com) (Free Next.js Deployment)
- **Database**: [MongoDB Atlas](https://cloud.mongodb.com) (Managed Cloud Database)

---

## 📋 Prerequisites Checklist

1. A [GitHub](https://github.com/) account.
2. A [Render](https://render.com/) account (sign in with GitHub).
3. A [Vercel](https://vercel.com/) account (sign in with GitHub).
4. MongoDB Atlas account with the database user configured.

---

## Step 1: Initialize Git and Push to GitHub

1. Open your terminal in the `clgmanagement` root folder:
   ```bash
   git init
   git add .
   git commit -m "feat: CampusResolve full-stack grievance platform"
   ```

2. Create a new repository on [GitHub](https://github.com/new) named `campus-resolve` (set it to **Public** or **Private**).

3. Link and push your repository:
   ```bash
   git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/campus-resolve.git
   git branch -M main
   git push -u origin main
   ```

---

## Step 2: Configure MongoDB Atlas for Cloud Access

To allow Render's cloud servers to connect to your MongoDB cluster:

1. Log in to [MongoDB Atlas](https://cloud.mongodb.com/).
2. In the left sidebar, click **Network Access** (under *Security*).
3. Click the green **Add IP Address** button.
4. Click **Allow Access From Anywhere** (which fills `0.0.0.0/0`).
5. Click **Confirm** and wait 1 minute for it to become active.

---

## Step 3: Deploy Backend API to Render.com

1. Open the [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** (top right) ➔ Select **Web Service**.
3. Choose **Build and deploy from a Git repository** ➔ Click **Next**.
4. Connect and select your `campus-resolve` repository.
5. Fill in the service configuration:

   | Field | Recommended Value |
   | :--- | :--- |
   | **Name** | `campus-resolve-api` |
   | **Region** | Singapore / Frankfurt / Oregon (nearest to you) |
   | **Branch** | `main` |
   | **Root Directory** | `server` *(Important!)* |
   | **Runtime** | `Node` |
   | **Build Command** | `npm install` |
   | **Start Command** | `node src/server.js` (or `npm start`) |
   | **Instance Type** | `Free` |

6. Scroll down to **Environment Variables** and add the following keys:

   | Variable Key | Value | Description |
   | :--- | :--- | :--- |
   | `PORT` | `5000` | Server listening port |
   | `CLIENT_URL` | `*` | Allowed CORS origins (can update to Vercel URL later) |
   | `JWT_SECRET` | `campus_resolve_super_secret_jwt_key_2026_!#` | JWT authentication signature key |
   | `MONGODB_URI` | `mongodb+srv://<username>:<password>@<cluster>.mongodb.net/clgmanagement?retryWrites=true&w=majority` | MongoDB Atlas URI from your server/.env |
   | `GEMINI_API_KEY` | `<your-gemini-api-key>` | Google Gemini AI key from your server/.env |

7. Click **Create Web Service**.
8. Wait 2–3 minutes for the build to complete.
9. Once deployed, copy your backend URL:
   ```text
   https://campus-resolve-api.onrender.com
   ```
   *(Test in your browser at `https://campus-resolve-api.onrender.com/api/health` — it should return `{"status":"online"}`).*

---

## Step 4: Deploy Frontend to Vercel

1. Open the [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New...** ➔ Select **Project**.
3. Import your `campus-resolve` repository from GitHub.
4. In the configuration screen:
   - **Project Name**: `campus-resolve`
   - **Framework Preset**: `Next.js`
   - **Root Directory**: Click **Edit** ➔ Select `client` ➔ Click **Continue**.
5. Expand **Environment Variables** and add:

   | Variable Key | Value |
   | :--- | :--- |
   | `NEXT_PUBLIC_API_URL` | `https://campus-resolve-api.onrender.com` *(Your Render URL)* |
   | `NEXT_PUBLIC_WS_URL` | `https://campus-resolve-api.onrender.com` *(Your Render URL)* |

6. Click **Deploy**.
7. Vercel will build the Next.js bundle and provide your production URL (e.g. `https://campus-resolve.vercel.app`).

---

## Step 5: Post-Deployment Verification

1. **Open your live Vercel URL** in your browser or mobile phone.
2. Go to **Sign In** ➔ Use the **1-Click Demo Logins** (`Student`, `IT Staff`, `Dean Admin`, `Principal`).
3. Lodge a new grievance with photo proof and verify that **AI Triage** categorizes the issue.
4. Open the **Admin Console** ➔ View real-time SLA metrics and resolution charts.

---

## 🛠️ Helpful Tips & Troubleshooting

- **Render Free Tier Cold Starts**: On Render's free tier, backend instances spin down after 15 minutes of inactivity. The first request after sleep may take ~30–45 seconds to wake up.
- **Updating Code**: Whenever you push changes to GitHub (`git push origin main`), both Render and Vercel will automatically trigger zero-downtime redeployments!
