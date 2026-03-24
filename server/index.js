/**
 * Updated Server with MongoDB Integration
 * Connects to MongoDB on startup with fallback to memory mode
 */

const path = require("node:path");
const http = require("node:http");
const express = require("express");
const { Server } = require("socket.io");
const { registerSocketHandlers } = require("./socket");
const mlRouter = require("./ml/mlRouter");
const { connectDB, isConnected } = require("./db/connection");
const db = require("./db/database");
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST"]
  }
});
const PORT = process.env.PORT || 3000;

// ============= MIDDLEWARE =============

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "..", "views"));
app.use(express.static(path.join(__dirname, "..", "public")));

// ============= DATABASE INITIALIZATION =============

async function initializeApp() {
  try {
    // Try to connect to MongoDB
    await connectDB();
    db.setUseMemory(false);
    console.log('✅ Using MongoDB database');
  } catch (error) {
    console.error('⚠️  MongoDB connection failed, using in-memory storage:', error.message);
    db.setUseMemory(true);
  }
}

// ============= ROUTES =============

app.get("/", (request, response) => {
  response.render("index", {
    pageTitle: "Study-Buddy | Real-Time Quiz Room",
  });
});

app.get("/host", (request, response) => {
  response.render("host", {
    pageTitle: "Study-Buddy Host Console",
  });
});

app.get("/player", (request, response) => {
  response.render("player", {
    pageTitle: "Study-Buddy Player Console",
    roomCode: String(request.query.room || "").trim().toUpperCase(),
    playerName: String(request.query.name || "").trim(),
  });
});

app.get("/display", (request, response) => {
  response.render("display", {
    pageTitle: "Study-Buddy Classroom Display",
    roomCode: String(request.query.room || "").trim().toUpperCase(),
  });
});

app.get("/health", async (request, response) => {
  const dbStatus = await db.healthCheck();
  response.json({ 
    ok: true,
    timestamp: new Date().toISOString(),
    database: dbStatus
  });
});

// ML API Routes
app.use("/api/ml", mlRouter);

// ============= 404 HANDLER =============

app.use((req, res) => {
  console.warn(`⚠️  404: ${req.method} ${req.path}`);
  res.status(404).json({ 
    error: "Route not found",
    path: req.path,
    method: req.method
  });
});

// ============= ERROR HANDLING =============

app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(500).json({ 
    error: err.message,
    environment: process.env.NODE_ENV 
  });
});

// ============= SOCKET.IO =============

registerSocketHandlers(io);

// ============= SERVER STARTUP =============

async function startServer() {
  try {
    // Initialize app (connect to DB)
    await initializeApp();

    // Start server
    server.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════╗
║  📚 Study-Buddy Quiz Room                  ║
╠════════════════════════════════════════════╣
║  🌐 Server: http://localhost:${PORT}         
║  📊 ML API: http://localhost:${PORT}/api/ml   
║  🗄️  Database: ${isConnected() ? 'MongoDB ✅' : 'Memory ⚠️'}
║  🔧 Mode: ${process.env.NODE_ENV || 'development'}
╚════════════════════════════════════════════╝
      `);
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('📛 SIGTERM received, shutting down gracefully...');
      server.close(async () => {
        await db.cleanup();
        process.exit(0);
      });
    });

    process.on('SIGINT', async () => {
      console.log('📛 SIGINT received, shutting down gracefully...');
      server.close(async () => {
        await db.cleanup();
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

// Start server if this file is run directly (local / Render)
if (require.main === module) {
  startServer();
} else {
  // Serverless environment (Vercel)
  initializeApp(); // ensure DB connects
}

module.exports = app;
