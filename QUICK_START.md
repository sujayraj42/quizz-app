# ✅ Complete MongoDB Setup Guide

**Quick reference for completing your MongoDB + Railway + Vercel deployment**

---

## 🎯 What Was Created

| File | Purpose |
|------|---------|
| `server/db/connection.js` | MongoDB connection manager with pooling |
| `server/db/models.js` | 8 Mongoose data models |
| `server/db/database.js` | Database service abstraction layer (dual-mode) |
| `server/index.js` | Updated with MongoDB initialization |
| `.env.example` | Environment variables template |
| `vercel.json` | Vercel deployment config |
| `railway.json` | Railway deployment config |
| `ENVIRONMENT_VARIABLES.md` | Env var documentation |
| `MONGODB_INTEGRATION_GUIDE.md` | How to use database service |
| `MONGODB_RAILWAY_VERCEL_SETUP.md` | Step-by-step deployment guide |
| `PRODUCTION_CHECKLIST.md` | Pre-deployment verification |
| `scripts/db-init.js` | Database initialization script |

---

## 🚀 Next Steps (In Order)

### Step 1️⃣: Local Setup (5 minutes)

```bash
# Install dependencies
npm install

# Create .env file in project root
# Copy-paste this:
MONGODB_URI=mongodb://localhost:27017/study-buddy
NODE_ENV=development
PORT=3000

# Start MongoDB (if not running)
# Windows: mongod
# macOS: brew services start mongodb-community
# Linux: sudo systemctl start mongod

# Start server
npm run dev

# You should see:
# ✅ Using MongoDB database
# (or ⚠️ Running in memory mode - still works!)
```

### Step 2️⃣: Test Locally (5 minutes)

```bash
# In another terminal, test health endpoint
curl http://localhost:3000/health

# Initialize sample data
npm run db:init
```

### Step 3️⃣: Deploy to Supabase (10 minutes)

1. Go to https://supabase.com
2. Create account + connect GitHub
3. Create new project in Supabase dashboard
4. Select your repository and configure deploy settings
5. In Supabase Settings → API, copy `SUPABASE_URL` and `SUPABASE_KEY`
6. In Supabase Deployments → Environment Variables, set:
   ```
   MONGODB_URI=<your MongoDB URI>
   NODE_ENV=production
   SUPABASE_URL=<your Supabase URL>
   SUPABASE_KEY=<your Supabase service_role key>
   ```
7. Click "Deploy"
8. Wait 2-3 minutes
9. Copy your Supabase URL: `https://your-app.supabase.co`

### Step 4️⃣: Deploy Frontend to Vercel (5 minutes)

1. Go to https://vercel.com
2. Click "New Project"
3. Import your GitHub repository
4. Go to "Settings" → "Environment Variables"
5. Add:
   ```
   MONGODB_URI: <same as Railway>
   NODE_ENV: production
   ```
6. Click "Deploy"
7. Wait 2-3 minutes
8. Copy your Vercel URL: `https://your-app.vercel.app`

### Step 5️⃣: Verify Production (5 minutes)

```bash
# Test Railway backend
curl https://your-railway-url.railway.app/health

# Test Vercel frontend
curl https://your-vercel-url.vercel.app/health

# Should both return:
# {"ok":true,"database":"connected"}
```

---

## 📋 Key Files to Remember

### `server/db/database.js` - Your Database API
```javascript
// This is how you use the database service:

const db = require('./db/database');

// Create room
const room = await db.createRoom({...});

// Record answer
await db.recordAnswer({...});

// Get performance
const perf = await db.getPerformance(studentId);
```

### `server/index.js` - Server Entry Point
- ✅ Initializes MongoDB connection
- ✅ Sets up Express routes
- ✅ Configures Socket.io
- ✅ Falls back to memory if MongoDB fails

### `scripts/db-init.js` - Initialize Sample Data
```bash
npm run db:init
```

---

## 🔧 Environment Variables

### Local Development (`.env`)
```
MONGODB_URI=mongodb://localhost:27017/study-buddy
NODE_ENV=development
PORT=3000
```

### Production (Railway + Vercel)
```
MONGODB_URI=mongodb+srv://username:password@cluster...
NODE_ENV=production
```

---

## 📊 Database Structure

8 collections auto-created in MongoDB:

1. **rooms** - Quiz rooms
2. **students** - Student profiles
3. **answerrecords** - Individual answers
4. **quizsessions** - Session data
5. **performances** - Analytics per student
6. **difficultyprogression** - Difficulty tracking
7. **questions** - Question bank
8. **leaderboards** - Leaderboard entries

---

## ✨ Key Features Enabled

✅ **Data Persistence** - All quiz data saved to MongoDB
✅ **Analytics** - Student performance tracked automatically  
✅ **Leaderboards** - Persistent rankings across sessions
✅ **ML Integration** - Analytics feed ML engines
✅ **Dual Mode** - Works with or without MongoDB
✅ **Production Ready** - Connection pooling, error handling

---

## 🧪 Quick Tests

### Test 1: Health Check
```bash
curl http://localhost:3000/health
# {"ok":true,"database":"connected"}
```

### Test 2: Record Answer
```bash
curl -X POST http://localhost:3000/api/ml/analytics/record \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "test123",
    "answerData": {
      "roomCode": "ABC123",
      "questionId": "q1",
      "correct": true,
      "timeSpent": 10
    }
  }'
```

### Test 3: Get Student Data
```bash
curl http://localhost:3000/api/ml/analytics/student/test123
```

---

## 🚨 Troubleshooting

### "Cannot connect to MongoDB"
- Is MongoDB running? (`mongod` on Windows)
- Is `.env` created with correct URI?
- Check: `mongodb://localhost:27017/study-buddy`

### "Module not found"
- Run: `npm install`
- Check node_modules exists

### "Cannot find .env"
- Create file named `.env` (not `.env.txt`)
- Put in project root (same level as package.json)
- Restart: `npm run dev`

### "App crashes after deploy"
- Check Vercel/Railway environment variables
- Check logs in dashboard
- Ensure MONGODB_URI is set

### Data not persisting
- Check database connection: `curl /health`
- If "memory" mode: MongoDB not running
- For production: MongoDB URI may be wrong

---

## 📚 Full Documentation

- **Setup Details**: `MONGODB_RAILWAY_VERCEL_SETUP.md`
- **Database API**: `MONGODB_INTEGRATION_GUIDE.md`
- **Deployment Steps**: `PRODUCTION_CHECKLIST.md`
- **Environment Variables**: `ENVIRONMENT_VARIABLES.md`

---

## ✅ Deployment Checklist

**Before deploying:**
- [ ] `.env` created with correct MongoDB URI
- [ ] `.gitignore` includes `.env`
- [ ] `npm install` completed
- [ ] `npm run dev` works locally
- [ ] `curl http://localhost:3000/health` returns success
- [ ] Code pushed to GitHub

**Railway:**
- [ ] Project created in Railway
- [ ] MongoDB service added
- [ ] Environment variables set
- [ ] Deployment successful
- [ ] Health endpoint works

**Vercel:**
- [ ] Project imported from GitHub
- [ ] Environment variables set
- [ ] Deployment successful
- [ ] Health endpoint works

---

## 🎓 Usage Examples

### In Socket.io Handler
```javascript
socket.on('join_room', async (data) => {
  const student = await db.createStudent({
    name: data.playerName,
    roomCode: data.roomCode
  });
  socket.join(data.roomCode);
  io.to(data.roomCode).emit('player_joined', student);
});
```

### In API Endpoint
```javascript
app.post('/api/answer', async (req, res) => {
  await db.recordAnswer(req.body);
  const perf = await db.getPerformance(req.body.studentId);
  res.json(perf);
});
```

---

## 🚀 Your App is Ready!

**Local:** http://localhost:3000  
**Railway:** https://your-app.railway.app  
**Vercel:** https://your-app.vercel.app  

All pointing to the same MongoDB database! 🎉

---

**Questions?** Check the detailed guides linked above.  
**Something broken?** See Troubleshooting section.  
**Ready to deploy?** Follow PRODUCTION_CHECKLIST.md step-by-step.
