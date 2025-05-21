const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const PORT = 3002;

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("📡 User connected:", socket.id);

  socket.on("join", (room) => {
    socket.join(room);
    console.log(`👥 User ${socket.id} joined room ${room}`);

    // Broadcast to others in the room that someone joined
    socket.to(room).emit("joined", socket.id);
  });

  socket.on("offer", ({ room, sdp }) => {
    console.log(`📨 Offer from ${socket.id}`);
    socket.to(room).emit("offer", { sdp });
  });

  socket.on("answer", ({ room, sdp }) => {
    console.log(`📨 Answer from ${socket.id}`);
    socket.to(room).emit("answer", { sdp });
  });

  socket.on("ice-candidate", ({ room, candidate }) => {
    console.log(`📨 ICE Candidate from ${socket.id}`);
    socket.to(room).emit("ice-candidate", { candidate });
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Signaling server is running at ws://<your-ip>:${PORT}`);
});
