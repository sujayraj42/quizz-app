# Environment Variables Configuration

## Development Setup

### Create `.env` file

Create a file named `.env` in your project root (same level as `package.json`):

```bash
# MongoDB Connection String
MONGODB_URI=mongodb://localhost:27017/study-buddy

# Server Configuration
PORT=3000
NODE_ENV=development

# CORS (optional)
CORS_ORIGIN=http://localhost:3000
```

### For Production (Railway)

```bash
# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/study-buddy

# Server Configuration
PORT=8080
NODE_ENV=production

# CORS
CORS_ORIGIN=https://your-domain.com
```

### For Production (Vercel)

Set these in Vercel dashboard (Settings → Environment Variables):

```
MONGODB_URI: mongodb+srv://username:password@...
NODE_ENV: production
CORS_ORIGIN: https://your-vercel-domain.vercel.app
```

---

## Getting Your Values

### MONGODB_URI

**Local Development:**
```
mongodb://localhost:27017/study-buddy
```

**MongoDB Atlas (Cloud):**
1. Go to https://www.mongodb.com/cloud/atlas
2. Click "Database" → "Connect"
3. Choose "Connection string"
4. Copy format: `mongodb+srv://username:password@cluster.mongodb.net/study-buddy`

### PORT

- Local: 3000 (default)
- Railway: 8080 or assigned port
- Vercel: Auto-assigned (ignore this)

### NODE_ENV

- development: Local development
- production: Railway/Vercel deployment

### CORS_ORIGIN

- Local: http://localhost:3000
- Vercel: https://your-app.vercel.app
- Railway: https://your-app.railway.app

---

## Important Security Notes

⚠️ **DO NOT:**
- Commit `.env` file to Git
- Share your `MONGODB_URI` with anyone
- Use test credentials in production
- Use weak passwords

✅ **DO:**
- Add `.env` to `.gitignore`
- Rotate passwords regularly
- Use strong passwords (12+ chars, mixed case, numbers, symbols)
- Keep backups of credentials

---

## Verify Environment Variables

After setting up `.env`, verify it's working:

```bash
# Test local development
npm run dev

# Should see in console:
# ✅ MongoDB connected
# or
# ⚠️ Running in memory mode (if MongoDB not available)
```

Check if variables are loaded:

```javascript
// This works in your code:
console.log(process.env.MONGODB_URI);
console.log(process.env.PORT);
console.log(process.env.NODE_ENV);
```

---

## `.gitignore` Configuration

Make sure your `.gitignore` includes:

```
# Environment variables
.env
.env.local
.env.*.local

# Dependencies
node_modules/

# Logs
logs/
*.log
npm-debug.log*

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
```

---

## Common Issues

### Error: "Cannot find module 'dotenv'"

```bash
npm install dotenv
```

### Error: "MONGODB_URI is undefined"

1. Check `.env` file exists
2. Check file name is exactly `.env` (not `.env.txt`)
3. Restart `npm run dev`
4. Check `.env` is in project root

### Error: "Cannot connect to MongoDB"

1. Check MONGODB_URI value
2. If local: Is MongoDB running?
3. If Atlas: Is IP whitelisted?
4. Is username/password correct?

### Production: Env vars not working

1. Check variables set in Railway/Vercel dashboard
2. Restart deployment after setting vars
3. Check for typos in variable names
4. Make sure production vars are enabled

---

## Reference: All Available Variables

```
MONGODB_URI          → MongoDB connection string
PORT                 → Server port number
NODE_ENV            → development/production
CORS_ORIGIN         → Allow CORS from this origin
SESSION_SECRET      → Session security key (optional)
```

---

**Your environment is now configured!** 🎉
