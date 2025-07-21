import express from 'express';
import dotenv from "dotenv";
import cors from 'cors';
import http from 'http';
import { connectDB } from './lib/db.js';
import userRouter from './roures/userRoutes.js';
import messageRouter from './roures/messageRoutes.js';
import { Server } from 'socket.io';

dotenv.config();
//create Express app and HTTP Server
const app=express();
const server= http.createServer(app) 

//Initialize socket.io server
export const io=new Server(server,{
    cors:{origin:"*"}
})
//Store online users
export const userSocketMap ={};

//Socket.io connection handler
io.on("connection",(Socket)=>{
    const userId=Socket.handshake.query.userId;
    console.log("User Connected",userId);
    if(userId) userSocketMap[userId]=Socket.id;

    //Emit online use to all connected client
    io.emit("getOnlineUsers",Object.keys(userSocketMap));

    Socket.on("disconnect",()=>{
        console.log("User Disconnected",userId);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers",Object.keys(userSocketMap))
    })
})
//Middleware setup
app.use(express.json({limits:"4mb"}));
app.use(cors());

//Routes setup
app.use("/api/status",(req,res)=> res.send("Server is live"));
app.use("/api/auth",userRouter);
app.use("/api/messages",messageRouter)

//connect to mongodb
await connectDB();

const PORT=process.env.PORT || 5000;
server.listen(PORT,()=> console.log("Server is running on PORT:" + PORT));

