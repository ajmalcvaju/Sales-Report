import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoute.js";
import productRoutes from "./routes/productRoute.js";
import customerRoutes from "./routes/customerRoutes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
dotenv.config();

const MONGO ="mongodb+srv://ajmalmayanad:Ajmal12%40@mern.yfblm.mongodb.net/?retryWrites=true&w=majority&appName=MERN";

mongoose
  .connect(MONGO)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors());

app.use(cors({
  origin: [
    'https://sales-bjgw24yqv-ajmalmayanads-projects.vercel.app'
  ],
  credentials: true,
}));


app.listen(3000, () => {
  console.log("server listen on port 3000");
});

app.use("/api/products", productRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/auth", authRoutes);

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  return res.status(statusCode).json({
    success: false,
    message,
    statusCode,
  });
});
