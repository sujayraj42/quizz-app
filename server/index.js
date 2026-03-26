const path = require("node:path");
const http = require("node:http");
const express = require("express");
const { Server } = require("socket.io");
const { registerSocketHandlers } = require("./socket");
const mlRouter = require("./ml/mlRouter");
const { connectDB, isConnected } = require("./db/connection");
const db = require("./db/database");

require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST"],
  },
  transports: ["websocket", "polling"],
  perMessageDeflate: false,
  connectionStateRecovery: {
    maxDisconnectionDuration: Number(process.env.RECONNECT_GRACE_MS || 60000),
    skipMiddlewares: true,
  },
  pingInterval: Number(process.env.SOCKET_PING_INTERVAL || 25000),
  pingTimeout: Number(process.env.SOCKET_PING_TIMEOUT || 20000),
});
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "..", "views"));
app.use(express.static(path.join(__dirname, "..", "public")));

async function initializeApp() {
  try {
    const connection = await connectDB();
    db.setUseMemory(!connection);
    console.log(`Using ${connection ? "MongoDB" : "in-memory"} database`);
  } catch (error) {
    console.error("MongoDB connection failed, using in-memory storage:", error.message);
    db.setUseMemory(true);
  }
}

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

app.get("/health", async (_request, response) => {
  const dbStatus = await db.healthCheck();
  response.json({
    ok: true,
    timestamp: new Date().toISOString(),
    database: dbStatus,
  });
});

app.use("/api/ml", mlRouter);
app.use("/api", require("./apiRouter"));

app.use((request, response) => {
  console.warn(`404: ${request.method} ${request.path}`);
  response.status(404).json({
    error: "Route not found",
    path: request.path,
    method: request.method,
  });
});

app.use((error, _request, response, _next) => {
  console.error("Server error:", error.message);
  response.status(500).json({
    error: error.message,
    environment: process.env.NODE_ENV,
  });
});

registerSocketHandlers(io);

async function startServer() {
  try {
    await initializeApp();

    server.listen(PORT, () => {
      console.log(`Study-Buddy listening on http://localhost:${PORT}`);
      console.log(`ML API available at http://localhost:${PORT}/api/ml`);
      console.log(`Database mode: ${isConnected() ? "MongoDB" : "Memory"}`);
    });

    const shutdown = async () => {
      server.close(async () => {
        await db.cleanup();
        process.exit(0);
      });
    };

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
} else {
  initializeApp();
}

module.exports = app;
