const express = require("express");
const { Server, Socket } = require("socket.io");
const bodyParser = require("body-parser");

const io = new Server(8000,{cors:true})
 
const app = express();
app.use(bodyParser.json());

// signalling
const emailtosocketIdmap = new Map();
const socketIdtoemailmap=new Map();

io.on("connection", (socket) => {
  console.log("Socket Connected",socket.id)
  // telling server to join on this room
  socket.on('join:room',data=>{
    console.log(data)
    const {email,room}=data;
    emailtosocketIdmap.set(email,socket.id)
    socketIdtoemailmap.set(socket.id,email)
    // existing user ko ye event jaayega
    // io.to(room).emit("user:joined", { email, id: socket.id });
    io.to(room).emit("user:joined",{email,id:socket.id})
    socket.join(room);
    io.to(socket.id).emit("join:room",data);
  })
  socket.on("user:call", ({ to, offer }) => {
    io.to(to).emit("incoming:call", { from: socket.id, offer });
  });
  socket.on('call:accepted',({to,ans})=>{
    io.to(to).emit("call:accepted", { from: socket.id, ans });
  })
  socket.on('peer:nego:needed',({to,offer})=>{
    console.log("peer:nego:needed",offer)
    io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
  })
  socket.on('peer:nego:done',({to,ans})=>{
    console.log("peer:nego:done",ans)
    io.to(to).emit("peer:nego:final", { from: socket.id, ans });
  })
});





