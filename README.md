# Study-Buddy Real-Time Quiz Room 🎓

A real-time competitive quiz platform built with Node.js, Express, and Socket.io. One host controls the game while students join and compete simultaneously—perfect for classrooms!

## 🌟 Features

- ✅ **Host Control** - Teacher creates and manages quiz rooms
- ✅ **Real-time Sync** - All students receive questions simultaneously via WebSockets
- ✅ **Live Leaderboard** - Scores update instantly after each question
- ✅ **Countdown Timer** - Per-question timing with auto-lock when expired
- ✅ **Responsive UI** - Works on desktop and mobile devices
- ✅ **Multiple Screens** - Host, student, and display screens
- ✅ **No Database Required** - In-memory state for quick deployment

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** (for version control) - [Download here](https://git-scm.com/)
- **Vercel Account** (for deployment) - [Sign up here](https://vercel.com/)
- **GitHub Account** (for repository) - [Sign up here](https://github.com/)

## 🚀 Local Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/study-buddy-quiz-room.git
cd study-buddy-quiz-room
```

### 2. Install Dependencies

```bash
npm install
```

This installs:
- **Express** - Web framework
- **Socket.io** - Real-time communication
- **EJS** - Template engine

### 3. Configure Environment (Optional)

Create a `.env` file in the root directory if needed:

```env
PORT=3000
NODE_ENV=development
```

### 4. Start Development Server

```bash
npm run dev
```

The server will start and watch for file changes. Open your browser to:
- **Host Screen**: http://localhost:3000/host
- **Student Screen**: http://localhost:3000/player
- **Display Screen**: http://localhost:3000/display

## 📖 How to Use

### For Teachers (Host)

1. Navigate to the **Host** screen
2. Click "Create Room" to generate a unique room code
3. Share the room code with students
4. Wait for students to join and see their names appear
5. Click "Start Quiz" to begin
6. View answers as they come in and advance to the next question
7. Watch the live leaderboard update automatically

### For Students (Players)

1. Navigate to the **Player** screen
2. Enter the room code provided by your teacher
3. Enter your name
4. Wait for the quiz to start
5. Answer each question before the timer ends
6. Watch your score update on the leaderboard
7. See final rankings at the end

### Display Screen (Optional)

1. Navigate to the **Display** screen
2. Enter the room code
3. Shows live leaderboard and current question status
4. Perfect for projecting on a classroom screen

## 📁 Project Structure

```
study-buddy-quiz-room/
├── server/
│   ├── index.js           # Main server entry point
│   ├── socket.js          # Socket.io event handlers
│   ├── roomManager.js     # Room management logic
│   └── questions.js       # Quiz questions database
├── public/
│   ├── js/
│   │   ├── host.js        # Host screen logic
│   │   ├── player.js      # Student screen logic
│   │   ├── display.js     # Display screen logic
│   │   └── shared.js      # Shared utilities
│   ├── css/
│   │   └── styles.css     # Main stylesheet
│   └── data/
│       ├── india-gk-pack.json      # Quiz questions
│       └── sample-question-pack.json # Sample questions
├── views/
│   ├── index.ejs          # Landing page
│   ├── host.ejs           # Host screen template
│   ├── player.ejs         # Student screen template
│   └── display.ejs        # Display screen template
├── scripts/
│   ├── check.js           # Validation script
│   └── generate_report.py # Report generation
├── package.json           # Dependencies
└── README.md             # This file
```

## 🔧 Available Scripts

```bash
# Start production server
npm start

# Start development server with auto-reload
npm run dev

# Validate project structure
npm run check
```

## 📊 Adding Quiz Questions

Edit [public/data/india-gk-pack.json](public/data/india-gk-pack.json) to add questions:

```json
[
  {
    "question": "What is the capital of India?",
    "options": ["Delhi", "Mumbai", "Bangalore", "Hyderabad"],
    "correct": 0,
    "timer": 15
  }
]
```

## 🌐 Deploying to Vercel

### Option 1: Deploy via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```

3. **Follow the prompts** and select your project folder

### Option 2: Deploy via GitHub Integration

1. **Push to GitHub** (see section below)
2. **Go to [vercel.com](https://vercel.com/)**
3. **Click "New Project"** → Select your GitHub repository
4. **Vercel auto-detects** Express app
5. **Click Deploy** and your site goes live!

### Vercel Configuration

A `vercel.json` file is included for proper Express routing. Here's what it does:

```json
{
  "version": 2,
  "builds": [{ "src": "server/index.js", "use": "@vercel/node" }],
  "routes": [{ "src": "/(.*)", "dest": "server/index.js" }]
}
```

**After deployment**, your app will be available at: `https://your-project.vercel.app`

## 📤 Uploading to GitHub

### Step 1: Create GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Enter repository name: `study-buddy-quiz-room`
3. Add description: `Real-time classroom quiz room with Express and Socket.io`
4. Choose **Public** (for Vercel integration to work easily)
5. **Skip** "Initialize with README" (you already have one)
6. Click **Create repository**

### Step 2: Initialize Git Locally

```bash
# Navigate to your project folder
cd "c:\Users\sujay\OneDrive\Documents\New project"

# Initialize git repository
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit: Study-Buddy Quiz Room setup"
```

### Step 3: Connect to GitHub

```bash
# Remove old remote if exists (ignore if error)
git remote remove origin

# Add your GitHub repository
git remote add origin https://github.com/YOUR_USERNAME/study-buddy-quiz-room.git

# Rename branch to main (GitHub default)
git branch -M main

# Push to GitHub
git push -u origin main
```

> **Note:** Replace `YOUR_USERNAME` with your actual GitHub username

### Step 4: Verify Upload

Go to `https://github.com/YOUR_USERNAME/study-buddy-quiz-room` to confirm your repository is live!

## 🎯 GitHub .gitignore

A `.gitignore` file is included to prevent uploading unnecessary files:

```
# Dependencies
node_modules/
npm-debug.log
npm-error.log

# Environment variables
.env
.env.local
.env.*.local

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp

# Build files
dist/
build/
```

## 🔐 Environment Variables

Create a `.env` file (not committed to Git) for sensitive data:

```env
PORT=3000
NODE_ENV=development
```

## 🐛 Troubleshooting

### "Cannot find module 'express'"
```bash
npm install
```

### Port 3000 already in use
```bash
# Windows - kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use different port
PORT=3001 npm start
```

### Socket.io connection issues
- Ensure server is running (`npm run dev`)
- Check firewall settings
- Verify WebSocket is enabled in browser

### Git push fails
```bash
# Check remote URL
git remote -v

# Update remote if incorrect
git remote set-url origin https://github.com/YOUR_USERNAME/study-buddy-quiz-room.git
```

## 📝 Development Tips

1. **Hot Reload**: Use `npm run dev` to automatically restart on file changes
2. **Test Questions**: Edit `questions.js` to add/modify quiz content
3. **Styling**: Modify `public/css/styles.css` for UI changes
4. **Socket Events**: Check `server/socket.js` for real-time logic

## 🚀 Next Steps for Production

- [ ] Add authentication (optional)
- [ ] Connect to a database (PostgreSQL, MongoDB)
- [ ] Add question authoring UI
- [ ] Implement user accounts
- [ ] Add analytics tracking
- [ ] Setup SSL/HTTPS (Vercel handles this automatically)
- [ ] Add email notifications

## 📚 Learning Resources

- [Express.js Guide](https://expressjs.com/)
- [Socket.io Documentation](https://socket.io/docs/v4/)
- [Node.js Tutorials](https://nodejs.org/en/docs/)
- [Vercel Deployment Guide](https://vercel.com/docs)
- [GitHub Guides](https://guides.github.com/)

## 📄 License

This project is licensed under the ISC License - see [package.json](package.json) for details.

## 💡 Need Help?

- **GitHub Issues**: Report bugs on your GitHub repository
- **Stack Overflow**: Tag questions with `socket.io` and `express`
- **Vercel Support**: [support.vercel.com](https://support.vercel.com/)

## 🎉 Credits

Built with ❤️ for classroom learning.

---

**Happy Teaching! 🎓**
