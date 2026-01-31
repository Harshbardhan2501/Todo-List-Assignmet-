const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

const router = express.Router()

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

module.exports = (jwtSecret) => {
  // register
  router.post('/register', async (req, res) => {
    const { email, username, password } = req.body || {}
    if (!email || !username || !password) {
      return res.status(400).json({ error: 'email, username and password are required' })
    }
    if (!emailRegex.test(email)) return res.status(400).json({ error: 'invalid email format' })
    if (typeof password !== 'string' || password.length < 8) return res.status(400).json({ error: 'password must be at least 8 characters' })

    try {
      // check exists
      const existing = await User.findOne({ $or: [{ email }, { username }] })
      if (existing) return res.status(409).json({ error: 'user with that email or username already exists' })

      const hashed = await bcrypt.hash(password, 10)
      const user = new User({ email, username, password: hashed, role: 'user' })
      await user.save()
      return res.status(201).json({ message: 'user created' })
    } catch (err) {
      console.error('register error', err)
      return res.status(500).json({ error: 'internal error' })
    }
  })

  // login: identifier = email or username
  router.post('/login', async (req, res) => {
    const { identifier, password } = req.body || {}
    if (!identifier || !password) return res.status(400).json({ error: 'identifier and password are required' })

    try {
      const user = await User.findOne({ $or: [{ email: identifier }, { username: identifier }] })
      if (!user) return res.status(401).json({ error: 'invalid credentials' })

      const match = await bcrypt.compare(password, user.password)
      if (!match) return res.status(401).json({ error: 'invalid credentials' })

      const payload = { id: user._id, username: user.username, email: user.email, role: user.role }
      const token = jwt.sign(payload, jwtSecret, { expiresIn: '1h' })
      // set HttpOnly cookie for convenience (works with fetch credentials)
      try {
        res.cookie('token', token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 60 * 60 * 1000 })
      } catch (e) {
        // ignore if cookies cannot be set
      }
      return res.json({ token })
    } catch (err) {
      console.error('login error', err)
      return res.status(500).json({ error: 'internal error' })
    }
  })

  // get current user from token
  router.get('/me', (req, res) => {
    const auth = req.headers.authorization
    if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'missing token' })
    const token = auth.split(' ')[1]
    try {
      const payload = jwt.verify(token, jwtSecret)
      return res.json({ user: payload })
    } catch (err) {
      return res.status(401).json({ error: 'invalid token' })
    }
  })

  return router
}
