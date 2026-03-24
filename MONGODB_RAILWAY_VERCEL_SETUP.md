# MongoDB + Railway + Vercel Complete Setup

## 📋 Table of Contents

1. [MongoDB Setup](#mongodb-setup)
2. [Railway Deployment](#railway-deployment)
3. [Vercel Deployment](#vercel-deployment)
4. [Testing](#testing)
5. [Troubleshooting](#troubleshooting)

---

## 🗄️ MongoDB Setup

### Option A: MongoDB Atlas (Recommended for Production)

1. **Create Account**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up with email
   - Verify email

2. **Create Organization & Project**
   - Create a project (e.g., "study-buddy")
   - Click "Create a Deployment"

3. **Create Cluster**
   - Select "Free" tier (M0)
   - Select region closest to you
   - Click "Create Deployment"
   - Wait 2-3 minutes for cluster creation

4. **Set Security**
   - Create database user:
     - Username: `admin`
     - Password: Generate secure password (save this!)
     - Click "Create User"
   
   - Add IP Whitelist:
     - Click "Network Access"
     - Click "Add IP Address"
     - Add `0.0.0.0/0` (or specific IP)
     - Click "Confirm"

5. **Get Connection String**
   - Click "Databases" → "Connect"
   - Select "Drivers"
   - Copy connection string
   - Replace `<password>` with your password
   - Example: 
     ```
     mongodb+srv://admin:myPassword@cluster0.xxxxx.mongodb.net/study-buddy
     ```

### Option B: Local MongoDB (Development Only)

```bash
# Windows
# Download from https://www.mongodb.com/try/download/community
# Run installer and select "Install as Windows Service"

# macOS
brew install mongodb-community
brew services start mongodb-community

# Linux
sudo apt-get install mongodb
sudo systemctl start mongod

# Test connection
mongo mongodb://localhost:27017/study-buddy
```

---

## � Supabase Deployment

### Step 1: Create Supabase Account

1. Go to https://supabase.com
2. Sign up with GitHub (recommended)
3. Create a new project (e.g., "study-buddy")

### Step 2: Create Project and Get API URL/Key

1. In Supabase dashboard, click "New project"
2. Fill project name and choose a region
3. Set a database password and create the project
4. In "Settings" → "API", copy:
   - `SUPABASE_URL`
   - `SUPABASE_KEY` (service_role for server-side)

### Step 3: Add Redis/Storage (Optional)

- If you need file upload or caching, enable Supabase Storage or Realtime/Tenant as needed.

### Step 4: Set Environment Variables in Supabase

With Supabase App Platform (Deployments):

1. Go to "Deployments" → "New Service" → "From GitHub"
2. Connect your GitHub repo `study-buddy-quiz-room`
3. Add environment variables:

```
MONGODB_URI=mongodb+srv://username:password@cluster...   # from Atlas or local
NODE_ENV=production
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_KEY=your-service-role-key
```

4. Make sure `PORT` is provided by default in Supabase App Platform.

### Step 5: Deploy App on Supabase

1. Select main branch and deploy
2. Wait for build (2-5 minutes)
3. Use the provided app URL, e.g., `https://your-app.supabase.co`

### Verify Supabase Deployment

```bash
curl https://your-app.supabase.co/health
# Should return: {"ok":true,"database":"connected"}
```

### Notes

- Your app continues to use MongoDB for data; Supabase acts as host/deploy runtime.
- Keep `SUPABASE_KEY` secret. Do not leak in client code.


---

## 🌐 Vercel Deployment

### Step 1: Push to GitHub

```bash
git add .
git commit -m "Add MongoDB backend"
git push origin main
```

### Step 2: Connect to Vercel

1. Go to https://vercel.com
2. Click "New Project"
3. Import your GitHub repository
4. Select your repo

### Step 3: Set Environment Variables

1. In Vercel, go to "Settings"
2. Click "Environment Variables"
3. Add:

```
Name: MONGODB_URI
Value: mongodb+srv://username:password@cluster...
Environments: Production, Preview, Development
```

4. Add:

```
Name: NODE_ENV
Value: production
Environments: Production

Name: NODE_ENV
Value: development
Environments: Preview, Development
```

### Step 4: Deploy

1. Click "Deploy"
2. Wait 2-3 minutes
3. App is live at: `https://study-buddy-xxxx.vercel.app`

### Verify Vercel Deployment

```bash
curl https://your-vercel-app.vercel.app/health
```

---

## 🧪 Testing

### Test 1: Health Check

```bash
# Should return { "ok": true, "db": "connected" }
curl https://your-app-url/health
```

### Test 2: Record Answer

```bash
curl -X POST https://your-app-url/api/ml/analytics/record \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "test123",
    "answerData": {
      "questionId": "q1",
      "correct": true,
      "timeSpent": 8,
      "category": "math"
    }
  }'
```

### Test 3: Get Student Data

```bash
curl https://your-app-url/api/ml/analytics/student/test123
```

### Test 4: Check Database Connection

Look at Vercel/Railway logs:
- If "✅ MongoDB connected" → Success
- If "⚠️ Running in memory mode" → Connection failed (still works with memory)

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────┐
│     Student Browser                     │
│  (host.html, player.html)              │
└────────────┬────────────────────────────┘
             │ Socket.io + REST API
┌────────────▼────────────────────────────┐
│  Railway/Vercel Server                  │
│  ┌──────────────────────────────────┐   │
│  │ Express.js + Socket.io           │   │
│  │ - Socket.io events              │   │
│  │ - REST API endpoints            │   │
│  │ - ML/Analytics routes           │   │
│  └──────────────┬───────────────────┘   │
│                 │ Mongoose ORM          │
│  ┌──────────────▼───────────────────┐   │
│  │ Database Service Layer           │   │
│  │ - DB abstraction                 │   │
│  │ - In-memory fallback             │   │
│  └──────────────┬───────────────────┘   │
└────────────────┼────────────────────────┘
                 │
        ┌────────▼───────────┐
        │  MongoDB Atlas     │
        │  (Cloud Database)  │
        └───────────────────┘
```

---

## 📊 Database Collections

Automatically created in MongoDB:

1. **rooms** - Quiz room instances
2. **students** - Student profiles
3. **answerrecords** - Individual answers
4. **quizsessions** - Quiz session data
5. **performances** - Student analytics
6. **difficultyprogression** - Difficulty tracking
7. **questions** - Question bank
8. **leaderboards** - Leaderboard entries

---

## 🔐 Security Checklist

- ✅ MongoDB password strong (12+ chars, mixed)
- ✅ IP whitelist configured (if using Atlas)
- ✅ Environment variables set in Railway/Vercel
- ✅ `.env` NOT committed to Git
- ✅ `.gitignore` includes `.env`
- ✅ HTTPS enabled (automatic on Vercel/Railway)
- ✅ Database access logs reviewed

---

## 📝 Configuration Files

### vercel.json (Vercel)
```json
{
  "version": 2,
  "builds": [
    { "src": "server/index.js", "use": "@vercel/node" }
  ],
  "routes": [
    { "src": "/(.*)", "dest": "server/index.js" }
  ],
  "env": {
    "MONGODB_URI": "@mongodb_uri",
    "NODE_ENV": "production"
  }
}
```

### railway.json (Railway)
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "nixpacks"
  },
  "deploy": {
    "numReplicas": 1,
    "sleepApplication": false
  }
}
```

---

## 🐛 Troubleshooting

### Vercel: "Cannot find module 'mongoose'"

```bash
# Solution: Install dependencies
npm install

# Or build locally
npm run build

# Then push
git push origin main
```

### Railway: MongoDB connection timeout

1. Check IP whitelist in MongoDB Atlas
2. Verify connection string is correct
3. Check network connectivity

### Both: "Authentication failed"

- Verify username/password in connection string
- Check MongoDB user exists
- Check password doesn't have special characters (url-encode them)

### Both: "Cannot locate a valid mongod"

- Ensure MongoDB database exists in Atlas/local
- Check connection string format
- Try connecting with MongoDB Compass

---

## 🚀 Environment Variables Quick Reference

```bash
# .env (Local Development)
MONGODB_URI=mongodb://localhost:27017/study-buddy
NODE_ENV=development
PORT=3000

# Railway Environment Variables
MONGODB_URI=mongodb+srv://...
NODE_ENV=production
PORT=8080

# Vercel Environment Variables
MONGODB_URI=mongodb+srv://...
NODE_ENV=production
```

---

## ✅ Deployment Checklist

### Before Deploying

- [ ] `.env` created with MONGODB_URI
- [ ] `.gitignore` includes `.env`
- [ ] `npm install` completed
- [ ] `npm run dev` works locally
- [ ] MongoDB connection tested
- [ ] All files pushed to GitHub

### Railway Deployment

- [ ] Railway account created
- [ ] Project connected to GitHub
- [ ] MongoDB service added
- [ ] Environment variables set
- [ ] Deployment successful
- [ ] Health endpoint returns success

### Vercel Deployment

- [ ] Vercel account created
- [ ] Project imported from GitHub
- [ ] Environment variables set
- [ ] Deployment successful
- [ ] Health endpoint returns success
- [ ] SSL certificate active

### Testing

- [ ] Health check works
- [ ] Can record answers
- [ ] Can query student data
- [ ] Leaderboard updates
- [ ] Real-time updates via Socket.io
- [ ] No errors in logs

---

## 📞 Support

| Issue | Solution |
|-------|----------|
| MongoDB connection fails | Check URI, IP whitelist, credentials |
| Deployment fails | Check logs, verify dependencies |
| App crashes after deploy | Check environment variables |
| No data persisting | Verify database connection |
| Slow performance | Check MongoDB performance, add indexes |

---

## 🎓 Next Steps

1. ✅ Create MongoDB database
2. ✅ Set up Railway project
3. ✅ Configure Vercel deployment
4. ✅ Test all endpoints
5. ✅ Monitor logs and performance
6. ✅ Scale as needed

---

**Your production deployment is ready!** 🚀
