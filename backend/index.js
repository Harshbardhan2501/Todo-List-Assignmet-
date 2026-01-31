const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const connectDB = require('./config/db')

dotenv.config()

const app = express()
// enable CORS for the frontend so credentials (cookies) can be sent
// Support multiple origins via comma-separated env var FRONTEND_ORIGINS
const FRONTEND_ORIGINS = (process.env.FRONTEND_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map(s => s.trim())

app.use(cors({
  origin: function (origin, callback) {
    // allow requests like curl or mobile apps with no origin
    if (!origin) return callback(null, true)
    if (FRONTEND_ORIGINS.indexOf(origin) !== -1) return callback(null, true)
    return callback(new Error('CORS not allowed by server'))
  },
  credentials: true,
}))
// express will set cookies via res.cookie() without extra middleware
app.use(express.json())

const PORT = process.env.PORT || 4000
const MONGODB_URI = process.env.MONGODB_URI
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'

// connect to MongoDB
connectDB(MONGODB_URI).catch(err => {
  console.error('Failed to connect to MongoDB. Exiting.')
  process.exit(1)
})

// mount auth routes with jwt secret under /api/auth
const authRoutesFactory = require('./routes/auth')
app.use('/api/auth', authRoutesFactory(JWT_SECRET))

// auth middleware factory (attaches req.user)
const authMiddleware = require('./middleware/auth')(JWT_SECRET)
const requireRole = require('./middleware/role')

// todos routes - protected
app.use('/api/todos', authMiddleware, require('./routes/todos'))

// admin routes - protected + role check
app.use('/api/admin', authMiddleware, requireRole('admin'), require('./routes/admin'))

app.get('/', (req, res) => res.send('Exelence backend'))

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`)
})
