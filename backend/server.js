require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const app = require("./src/app");

const server = http.createServer(app);
const PORT = process.env.PORT || 5050;

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "https://hometown-hub-backend.onrender.com"
    ],
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

// MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => console.log(err));
