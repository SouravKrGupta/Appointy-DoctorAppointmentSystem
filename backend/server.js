import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import path from 'path'
import 'dotenv/config'
import { fileURLToPath } from 'url'
import connectDB from './config/mongodb.js'
import adminRouter from './routes/adminRoute.js'
import doctorRouter from './routes/doctorRoute.js'
import userRouter from './routes/userRoute.js'
import { initRealtime } from './utils/socket.js'

// app config
const app = express()
const port = process.env.PORT || 4000
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Connect to database (CALL THE FUNCTION)
connectDB()

// middlewares
app.use(express.json())
app.use(cors())
app.use('/media', express.static(path.join(__dirname, 'media')))

// api endpoints
app.use('/api/admin', adminRouter)
app.use('/api/doctor', doctorRouter)
app.use("/api/user", userRouter)


app.get("/", (req, res) => {
  res.send("API Working")
});

app.get('/test-db', (req, res) => {
  const state = mongoose.connection.readyState;
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  if (state === 1) {
    res.send('Database is connected');
  } else {
    res.status(500).send('Database is NOT connected');
  }
});


initRealtime(app, port)
