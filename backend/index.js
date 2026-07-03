// const express = require('express')// method-1
import express from "express"; // method-2
import dotenv from "dotenv"; 
import connectDB from "./config/database.js";
import userRoute from "./routes/userRoute.js";
import messageRoute from "./routes/messageRoute.js";
import statusRoute from "./routes/statusRoute.js";
import aiRoute from "./routes/aiRoute.js";
import cookieParser from "cookie-parser";
import cors from "cors";
// import path from "path";
import { app,server } from "./socket/socket.js";
dotenv.config({});

 
const PORT = process.env.PORT || 5000;

// const _dirname=path.resolve();


// middleware
app.use(express.urlencoded({extended:true}));
app.use(express.json()); 
app.use(cookieParser());
// const corsOption={
//     origin:'https://chatting-app-frontend-lrli.onrender.com',
//     credentials:true
// };
// app.use(cors(corsOption)); 

const corsOption = {
    origin: [process.env.FRONTEND_URL || 'https://chatting-app-navy-eight.vercel.app', 'http://localhost:3000'],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOption));




import rateLimit from "express-rate-limit";
app.set("trust proxy", 1);

// Configure rate limit
const apiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 5 minutes)
  message: { message: "Too many requests from this IP, please try again after 5 minutes" },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply rate limiter to all API routes
app.use("/api", apiLimiter);

// routes
app.use("/api/v1/user",userRoute); 
app.use("/api/v1/message",messageRoute);
app.use("/api/v1/status", statusRoute);
app.use("/api/v1/ai", aiRoute);

app.use("/uploads", express.static("uploads"));

// app.use(express.static(path.join(_dirname,"/frontend/dist")));
// app.get("*", (_, res) => {
//   res.sendFile(path.resolve(_dirname, "frontend", "dist", "index.html"));
// });

server.listen(PORT, ()=>{
    connectDB();
  console.log(`Server listen at prot ${PORT}`);
});

