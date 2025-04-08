import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import authRoutes from "./routes/authRoute.js"
import productRoutes from "./routes/productRoute.js"
import customerRoutes from "./routes/customerRoutes.js"
import cookieParser from 'cookie-parser'
import cors from 'cors';
dotenv.config()

mongoose.connect('mongodb://localhost:27017').then(()=>{
    console.log("Connected to Mongodb")
}).catch((err)=>{
    console.log(err)
})

const app=express()
app.use(express.json())
app.use(cookieParser())
app.use(cors());

app.use(cors({
    origin: 'http://localhost:5173', // your frontend origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  }));
 
app.listen(3000,()=>{
    console.log("server listen on port 3000")
})
  

app.use("/api/products",productRoutes)
app.use("/api/customer",customerRoutes)
app.use("/api/auth",authRoutes)

app.use((err,req,res,next)=>{
    const statusCode=err.statusCode||500
    const message=err.message||"Internal Server Error"
    return res.status(statusCode).json({
        success:false,
        message,
        statusCode,
    })
})