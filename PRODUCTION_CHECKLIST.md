#!/bin/bash

# Production Deployment Checklist
# Complete all items before deploying to production

## ✅ Pre-Deployment

### Code Quality
- [ ] All linting errors fixed (`npm run lint`)
- [ ] No console.log() statements in production code
- [ ] Error handling on all database calls
- [ ] Input validation on all API endpoints
- [ ] No hardcoded credentials in code

### Testing
- [ ] Tested locally with MongoDB
- [ ] Tested in-memory mode (without MongoDB)
- [ ] Health endpoint returns success
- [ ] Socket.io connections work
- [ ] API endpoints tested with curl/Postman
- [ ] No runtime errors in console

### Documentation
- [ ] README.md up to date
- [ ] .env.example created with all variables
- [ ] API documentation complete
- [ ] Deployment guide written
- [ ] Database schema documented

### Database Setup
- [ ] MongoDB Atlas account created
- [ ] Cluster created (M0 free tier OK for start)
- [ ] Database user created with strong password
- [ ] IP whitelist configured
- [ ] Connection string tested locally

### Repository Setup
- [ ] Code pushed to GitHub
- [ ] .gitignore includes .env
- [ ] No sensitive data in commits
- [ ] Repository is public/accessible
- [ ] Branch protection enabled on main

---

## ☁️ Supabase Deployment

### Create Supabase Project
- [ ] Supabase account created
- [ ] Project created in Supabase dashboard
- [ ] GitHub connected to Supabase
- [ ] Repository selected

### Configure Project API
- [ ] SUPABASE_URL copied from Settings -> API
- [ ] SUPABASE_KEY (service_role) copied
- [ ] Optional features enabled (Storage/Realtime) if required

### Configure Environment
- [ ] MONGODB_URI set in Supabase variables
- [ ] NODE_ENV set to "production"
- [ ] SUPABASE_URL set
- [ ] SUPABASE_KEY set securely
- [ ] PORT handled by Supabase buildpack
- [ ] CORS_ORIGIN set to your domain

### Deploy Application
- [ ] Latest code pushed to GitHub
- [ ] Supabase deployment triggered
- [ ] Build succeeds (check logs)
- [ ] Deployment completes without errors
- [ ] App is accessible at Supabase URL
- [ ] Health endpoint works: `/health`

### Verify Supabase Deployment
```bash
curl https://your-supabase-app.supabase.co/health
# Should return: {"ok":true,"database":"connected"}
```

---

## 🌐 Vercel Deployment

### Create Vercel Project
- [ ] Vercel account created
- [ ] Project imported from GitHub
- [ ] Repository selected

### Configure Environment Variables
- [ ] MONGODB_URI set in Vercel
- [ ] NODE_ENV set to "production"
- [ ] All other env vars configured
- [ ] Variables enabled for Production

### Deploy Application
- [ ] Latest code pushed to GitHub
- [ ] Vercel deployment triggered automatically
- [ ] Build succeeds (check logs)
- [ ] Deployment completes
- [ ] App is accessible at Vercel URL
- [ ] Health endpoint works: `/health`

### Verify Vercel Deployment
```bash
curl https://your-vercel-app.vercel.app/health
# Should return: {"ok":true,"database":"connected"}
```

---

## 🔐 Security Checklist

### Authentication & Secrets
- [ ] MongoDB password is strong (12+ chars, mixed case, numbers, symbols)
- [ ] API keys not exposed in code
- [ ] Environment variables marked as secrets
- [ ] CORS properly configured (not wildcard in production)

### Database Security
- [ ] MongoDB IP whitelist configured
- [ ] Database user created with limited permissions
- [ ] Connection string uses SSL/TLS
- [ ] No public read/write on collections
- [ ] Indexes created for performance

### Application Security
- [ ] Input validation on all endpoints
- [ ] SQL injection protection (using Mongoose)
- [ ] Error messages don't leak sensitive info
- [ ] Logs don't contain passwords
- [ ] HTTPS enforced (auto by Vercel/Railway)

### Monitoring
- [ ] Error logging configured
- [ ] Database connection monitoring enabled
- [ ] Performance metrics tracked
- [ ] Alert system for failures setup

---

## 📊 Testing Production

### Health & Status
```bash
# Health check
curl https://your-domain/health

# Should return:
# {"ok":true,"timestamp":"2024-01-15T...","database":"connected"}
```

### API Testing
```bash
# Record answer
curl -X POST https://your-domain/api/ml/analytics/record \
  -H "Content-Type: application/json" \
  -d '{"studentId":"test","answerData":{...}}'

# Get analytics
curl https://your-domain/api/ml/analytics/student/test
```

### Real-Time Features
- [ ] Join quiz room works
- [ ] Players appear in real-time
- [ ] Answers recorded and visible
- [ ] Leaderboard updates live
- [ ] No Socket.io connection errors

---

## 🚨 Troubleshooting

### If Deployment Fails

**Vercel Build Error**
```bash
# Check build logs in Vercel dashboard
# Common issues:
# - Missing dependencies: npm install
# - Environment variables: Set in Vercel
# - Node version: Specify in package.json
# - Port issues: Remove hardcoded ports
```

**Railway Build Error**
```bash
# Check logs in Railway dashboard
# Common issues:
# - MongoDB connection: Check URI
# - Missing env vars: Set in Railway dashboard
# - Port binding: Ensure app listens to $PORT
```

**MongoDB Connection Error**
```bash
# Check connection string format
# mongodb+srv://username:password@cluster.mongodb.net/dbname

# Test locally:
# mongosh "mongodb+srv://username:password@cluster.mongodb.net"

# Common issues:
# - Wrong credentials
# - IP not whitelisted
# - Database doesn't exist
# - URL encoding needed for special chars
```

---

## 📈 Post-Deployment

### Monitor & Maintain
- [ ] Check logs daily for errors
- [ ] Monitor database performance
- [ ] Track uptime and response times
- [ ] Review error patterns
- [ ] Scale if needed (upgrade MongoDB tier)

### Backup & Recovery
- [ ] Enable MongoDB backups
- [ ] Test backup restoration
- [ ] Document recovery procedures
- [ ] Set up automated backups

### Updates & Maintenance
- [ ] Keep dependencies updated
- [ ] Patch security vulnerabilities
- [ ] Review and optimize queries
- [ ] Clean up old data periodically

---

## 🎉 Deployment Complete!

Your production deployment is ready when:
- ✅ Railway app is live and healthy
- ✅ Vercel app is live and healthy  
- ✅ Both connect to same MongoDB database
- ✅ Health endpoints return success
- ✅ API tests pass
- ✅ Real-time features work
- ✅ Security checklist complete
- ✅ Monitoring configured

**Congratulations! Your app is in production!** 🚀

---

### Emergency Contacts
- MongoDB Support: https://support.mongodb.com
- Railway Support: https://railway.app/support
- Vercel Support: https://vercel.com/support
- Your team: [Add team contacts here]

### Quick Links
- Railway Dashboard: https://railway.app/dashboard
- Vercel Dashboard: https://vercel.com/dashboard
- MongoDB Atlas: https://cloud.mongodb.com
- GitHub Repository: [Add repo URL here]
