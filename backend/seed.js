const dotenv = require('dotenv')
const connectDB = require('./config/db')
const User = require('./models/User')
const bcrypt = require('bcryptjs')

dotenv.config()

async function seed() {
  const MONGODB_URI = process.env.MONGODB_URI
  if (!MONGODB_URI) {
    console.error('MONGODB_URI not set in .env')
    process.exit(1)
  }

  await connectDB(MONGODB_URI)

  const users = [
    { email: 'admin@example.com', username: 'admin', password: 'AdminPass123', role: 'admin' },
    { email: 'user@example.com', username: 'user', password: 'UserPass123', role: 'user' },
  ]

  for (const u of users) {
    try {
      const existing = await User.findOne({ $or: [{ email: u.email }, { username: u.username }] })
      if (existing) {
        console.log(`User ${u.username} already exists`)
        continue
      }

      const hashed = await bcrypt.hash(u.password, 10)
      const user = new User({ email: u.email, username: u.username, password: hashed, role: u.role })
      await user.save()
      console.log(`Created user ${u.username} (${u.role})`)
    } catch (err) {
      console.error('Error creating user', u.username, err)
    }
  }

  console.log('Seeding complete')
  process.exit(0)
}

seed()
