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

const rooms = {};

io.on("connection", (socket) => {
  console.log("📡 User connected:", socket.id);

  socket.on("join", (roomId) => {
    if (!rooms[roomId]) rooms[roomId] = [];

    rooms[roomId].push(socket.id);
    socket.join(roomId);

    const usersInRoom = rooms[roomId];
    const isCaller = usersInRoom.length === 2;

    console.log(
      `👥 ${socket.id} joined room ${roomId}. Users now:`,
      usersInRoom
    );

    if (isCaller) {
      console.log(`📞 Sending 'ready' to first user ${usersInRoom[0]}`);
      io.to(usersInRoom[0]).emit("ready");
    }

    socket.on("disconnect", () => {
      rooms[roomId] = rooms[roomId].filter((id) => id !== socket.id);
      console.log(`❌ ${socket.id} disconnected from room ${roomId}`);
      if (rooms[roomId].length === 0) {
        delete rooms[roomId];
      }
    });
  });

  socket.on("offer", ({ room, sdp }) => {
    console.log(`📨 Received OFFER from ${socket.id} in room ${room}`);
    socket.to(room).emit("offer", { sdp });
  });

  socket.on("answer", ({ room, sdp }) => {
    console.log(`📨 Received ANSWER from ${socket.id} in room ${room}`);
    socket.to(room).emit("answer", { sdp });
  });

  socket.on("ice-candidate", ({ room, candidate }) => {
    console.log(`❄️ Received ICE candidate from ${socket.id} in room ${room}`);
    socket.to(room).emit("ice-candidate", { candidate });
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Signaling server is running at ws://<your-ip>:${PORT}`);
});
