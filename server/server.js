import express from "express"
import "dotenv/config";
import cors from "cors";
import connectDB from "./configs/db.js";
import { clerkMiddleware } from '@clerk/express'

connectDB()

const app = express()
app.use(cors()) // Enbale cross-origin Resource Sharing

// Middleware
app.use(express.json())
app.use(clerkMiddleware())

app.get('/', (req, res)=>res.send("API is working fine Anumifly"))

const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=> console.log(`Server running on port ${PORT}`));