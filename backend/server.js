const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

let activeRooms = {}; // Stores active rooms and users

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Handle user joining a room
  socket.on("joinRoom", ({ roomId, username }) => {
    if (!roomId) return; // Ensure roomId is valid
    socket.join(roomId);
    
    console.log(`User ${username} (${socket.id}) joined room ${roomId}`);

    // Initialize room if not exists
    if (!activeRooms[roomId]) {
      activeRooms[roomId] = { users: {} };
    }

    // Assign username
    activeRooms[roomId].users[socket.id] = username || `Guest-${socket.id.substring(0, 4)}`;

    // Broadcast updated user list
    io.to(roomId).emit("updateUsers", Object.values(activeRooms[roomId].users));
  });

  // Handle user sending a message
  socket.on("sendMessage", ({ roomId, text }) => {
    if (!roomId || !text.trim()) return;

    console.log(`Message in room ${roomId}: ${text}`);

    const senderName = activeRooms[roomId]?.users[socket.id] || "Unknown";
    const messageData = {
      text,
      sender: senderName,
      timestamp: new Date().toLocaleTimeString(),
    };

    io.to(roomId).emit("receiveMessage", messageData);
  });

  // Handle typing indicator
  socket.on("typing", ({ roomId, username }) => {
    if (!roomId) return;
    socket.to(roomId).emit("typing", `${username} is typing...`);
  });

  // Handle user disconnecting
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    for (const roomId in activeRooms) {
      if (activeRooms[roomId].users[socket.id]) {
        delete activeRooms[roomId].users[socket.id];

        // Notify others in the room
        io.to(roomId).emit("updateUsers", Object.values(activeRooms[roomId].users));

        // Remove empty rooms
        if (Object.keys(activeRooms[roomId].users).length === 0) {
          delete activeRooms[roomId];
        }
      }
    }
  });
});

server.listen(3000, () => console.log("✅ Server running on port 3000"));
