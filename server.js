const io = require("socket.io")(3002, {
  cors: {
    // origin: "http://localhost:3000",
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("a user connected");
  console.log("🔌 New client:", socket.id);

  socket.on("join", (room) => {
    socket.join(room);
    socket.to(room).emit("joined", socket.id); // แจ้งอีกฝั่งว่ามีคนใหม่เข้า
  });

  socket.on("offer", (data) => {
    socket.to(data.room).emit("offer", data); // ส่ง offer ไปให้อีกฝั่ง
    console.log("offer sent to : ", data.room);
  });

  socket.on("answer", (data) => {
    socket.to(data.room).emit("answer", data); // ส่ง answer ไปให้อีกฝั่ง
    console.log("answer sent to : ", data.room);
  });

  socket.on("ice-candidate", (data) => {
    socket.to(data.room).emit("ice-candidate", data); // ส่ง ICE
    console.log("ice-candidate sent to : ", data.room);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected : ", socket.id);
  });
});
