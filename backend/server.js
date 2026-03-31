require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const app = require("./src/app");

const server = http.createServer(app);
const PORT = process.env.PORT || 5050;
const requiredEnv = ["MONGO_URI", "JWT_SECRET"];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);

const socketOrigins = [
  "http://localhost:3000",
  "http://localhost:3001"
];

if (process.env.FRONTEND_URL) {
  socketOrigins.push(process.env.FRONTEND_URL);
}

for (const origin of (process.env.FRONTEND_URLS || "").split(",")) {
  const trimmedOrigin = origin.trim();
  if (trimmedOrigin) {
    socketOrigins.push(trimmedOrigin);
  }
}

const io = new Server(server, {
  cors: {
    origin: Array.from(new Set(socketOrigins)),
    methods: ["GET", "POST"]
  }
});

// 🔥 Make io globally available
global.io = io;

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinUserRoom", (userId) => {
    socket.join(userId);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

const startServer = async () => {
  if (missingEnv.length > 0) {
    console.error(`Missing required environment variables: ${missingEnv.join(", ")}`);
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

startServer();
