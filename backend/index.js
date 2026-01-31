const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const connectDB = require('./config/db')

dotenv.config()

const app = express()
// enable CORS for the frontend so credentials (cookies) can be sent
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173'
app.use(cors({ origin: FRONTEND_ORIGIN, credentials: true }))
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
