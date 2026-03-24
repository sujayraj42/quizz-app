# Deployment Guide

Complete step-by-step instructions for deploying Study-Buddy Quiz Room to GitHub and Vercel.

## 📋 Table of Contents

1. [GitHub Setup](#github-setup)
2. [Vercel Deployment](#vercel-deployment)
3. [Troubleshooting](#troubleshooting)
4. [Monitoring](#monitoring)

---

## GitHub Setup

### Prerequisites

- GitHub account created (https://github.com/signup)
- Git installed on your computer (https://git-scm.com/)
- Your project folder ready

### Step 1: Create GitHub Repository

1. Visit **[github.com/new](https://github.com/new)**
2. Fill in the following:
   - **Repository name**: `study-buddy-quiz-room`
   - **Description**: `Real-time classroom quiz room with Express and Socket.io`
   - **Public/Private**: Select **Public**
   - **Initialize with README**: Leave unchecked (we have our own README.md)
3. Click **Create repository** button

### Step 2: Setup Git Locally

Open PowerShell or Command Prompt and run:

```powershell
# Navigate to your project directory
cd "C:\Users\sujay\OneDrive\Documents\New project"

# Initialize git
git init

# Configure git (do this once globally or per project)
git config user.name "Your Name"
git config user.email "your.email@example.com"

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Study-Buddy Quiz Room"
```

### Step 3: Push to GitHub

```powershell
# Add remote repository (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/study-buddy-quiz-room.git

# Rename branch to 'main' (GitHub default since 2020)
git branch -M main

# Push files to GitHub
git push -u origin main
```

**You may be prompted to authenticate:**
- **Option A**: Enter GitHub username and [Personal Access Token](https://github.com/settings/tokens)
- **Option B**: Authorize through browser popup

### Step 4: Verify Repository

Visit: `https://github.com/YOUR_USERNAME/study-buddy-quiz-room`

You should see all your project files uploaded! ✅

### Updating Files After Changes

After making local changes:

```powershell
# Check what changed
git status

# Stage all changes
git add .

# Commit with a message
git commit -m "Description of changes"

# Push to GitHub
git push origin main
```

---

## Vercel Deployment

### Option A: Deploy via GitHub Integration (Recommended)

#### Prerequisites
- Repository pushed to GitHub (completed above)
- Vercel account created (https://vercel.com/signup)

#### Steps

1. **Go to Vercel**: https://vercel.com/dashboard
2. **Click "Add New..."** → **Project**
3. **Select "Import Git Repository"**
4. **Find your repository**: `study-buddy-quiz-room`
5. **Click Import**
6. **Configure Project**:
   - Framework: `Other` (since it's Express)
   - Root Directory: `./` (default)
   - Environment Variables: Leave empty for now
7. **Click Deploy** button

**Wait 2-3 minutes for deployment...**

Your app will be live at: `https://study-buddy-quiz-room.vercel.app`

#### Auto-Deploy on GitHub Push

Now whenever you push changes to GitHub:
```bash
git push origin main
```

Vercel **automatically redeploys** your app! 🚀

---

### Option B: Deploy via Vercel CLI

If you prefer command-line deployment:

#### Prerequisites
- Node.js installed
- Vercel CLI installed

#### Steps

```powershell
# Install Vercel CLI globally (do once)
npm install -g vercel

# Login to Vercel (opens browser)
vercel login

# Navigate to project
cd "C:\Users\sujay\OneDrive\Documents\New project"

# Deploy
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name? study-buddy-quiz-room
# - Directory? ./
# - Framework? Other
# - Deploy? Yes
```

**Output will show your live URL**

#### Redeploy After Changes

```powershell
vercel --prod
```

---

### Option C: Deploy via Docker (Advanced)

If you want more control:

1. Create `Dockerfile` in project root:
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 3000
CMD ["npm", "start"]
```

2. Deploy: `vercel` (it auto-detects Docker)

---

## Environment Variables

### Vercel Environment Setup

If your app needs environment variables (e.g., API keys):

1. Go to your **Vercel Project Dashboard**
2. **Settings** → **Environment Variables**
3. **Add** each variable:
   - Name: `PORT`
   - Value: `3000`
   - Select environments: Production, Preview, Development
4. **Save** and **Redeploy**

### Local Environment Variables

Create `.env` file (never commit this):

```env
PORT=3000
NODE_ENV=development
```

Access in your server code:
```javascript
const port = process.env.PORT || 3000;
```

---

## Vercel Configuration

Your `vercel.json` file handles:

- **Builds**: Tells Vercel to use @vercel/node runtime
- **Routes**: All requests go to `server/index.js`
- **Environment**: Sets production Node environment

No additional configuration needed! ✅

---

## Domain Setup (Optional)

Add a custom domain to your Vercel deployment:

1. **Vercel Dashboard** → Your Project → **Settings**
2. **Domains** section
3. **Add** your custom domain
4. **Update DNS** settings at your domain registrar
5. **Wait 24-48 hours** for DNS propagation

---

## Troubleshooting

### Git Issues

**"fatal: A git repository already exists"**
```powershell
rm -r .git
git init
```

**"Permission denied (publickey)"**
- Generate SSH key: https://docs.github.com/en/authentication/connecting-to-github-with-ssh
- Add to GitHub: https://github.com/settings/keys

**"failed to push"**
```powershell
# Pull latest changes first
git pull origin main --rebase

# Then push
git push origin main
```

### Vercel Issues

**"Build failed"**
1. Check build logs in Vercel Dashboard
2. Ensure all dependencies in `package.json`
3. Verify `server/index.js` exists

**"Cannot GET /"**
- Check `server/index.js` for route handling
- Verify `vercel.json` configuration

**"WebSocket connection failed"**
- Vercel supports WebSockets (Socket.io works fine)
- Check browser console for detailed errors
- Ensure client connects to correct URL

### Timeout Issues

If your app takes too long to start:

1. Add to `vercel.json`:
```json
{
  "regions": ["iad"]
}
```

2. Or check if you're doing heavy operations on startup

---

## Monitoring & Logs

### Vercel Logs

```powershell
# View live logs (with CLI)
vercel logs

# Filter by time
vercel logs --since 1h
```

### GitHub Actions (Auto-Testing)

Create `.github/workflows/test.yml` to run tests on every push:

```yaml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run check
```

---

## Performance Tips

1. **Enable Vercel Analytics**: Dashboard → Settings → Analytics
2. **Monitor response times** in Vercel Dashboard
3. **Use caching headers** in Express middleware
4. **Compress responses** with gzip middleware

---

## Security Checklist

- ✅ `.env` file in `.gitignore` (sensitive data not on GitHub)
- ✅ Use HTTPS (Vercel handles automatically)
- ✅ Validate user input (prevent Socket.io injection)
- ✅ Rate limit API endpoints
- ✅ Keep dependencies updated: `npm audit fix`

---

## Rollback & Disaster Recovery

### Rollback Vercel Deployment

1. Go to Vercel Dashboard → Deployments
2. Find previous working deployment
3. Click **Promote to Production**

### Restore from GitHub

```powershell
# View commit history
git log --oneline

# Revert to previous commit
git revert COMMIT_HASH

# Push reverted version
git push origin main
```

---

## Next Steps

1. ✅ Push to GitHub
2. ✅ Deploy to Vercel
3. ✅ Test live at `https://your-app.vercel.app`
4. ✅ Share link with your class!
5. 📝 Gather feedback from users
6. 🔄 Make improvements and push updates (auto-deploys!)

---

## Quick Reference

| Task | Command |
|------|---------|
| Initialize Git | `git init` |
| Add files | `git add .` |
| Commit | `git commit -m "message"` |
| Push to GitHub | `git push origin main` |
| Check status | `git status` |
| View logs | `git log` |
| Install CLI | `npm install -g vercel` |
| Deploy via CLI | `vercel` |
| View logs | `vercel logs` |

---

## Support

- **GitHub Issues**: [github.com/YOUR_USERNAME/study-buddy-quiz-room/issues](https://github.com/)
- **Vercel Support**: [support.vercel.com](https://support.vercel.com/)
- **Stack Overflow**: Tag with `express` and `socket.io`

---

**You're all set! Your app is now live! 🎉**
