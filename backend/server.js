import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import 'dotenv/config'
import connectDB from './config/mongodb.js'
import adminRouter from './routes/adminRoute.js'
import doctorRouter from './routes/doctorRoute.js'
import userRouter from './routes/userRoute.js'
import { initRealtime } from './utils/socket.js'
import { getMediaById } from './controllers/mediaController.js'

// app config
const app = express()
const port = process.env.PORT || 4000

app.set('trust proxy', 1)

const allowedOrigins = (process.env.CLIENT_URLS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true)
    }

    return callback(new Error('Not allowed by CORS'))
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
}

// Connect to database (CALL THE FUNCTION)
connectDB()

// middlewares
app.use(express.json())
app.use(cors(corsOptions))
app.get('/media/:id', getMediaById)

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


initRealtime(app, port, allowedOrigins)
