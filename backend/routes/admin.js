const express = require('express')
const { body, param, validationResult } = require('express-validator')
const User = require('../models/User')
const Todo = require('../models/Todo')

const router = express.Router()

// GET /api/admin/users - list users (admin only)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password')
    return res.json(users)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'internal error' })
  }
})

// PATCH /api/admin/users/:id/role - change user role
router.patch('/users/:id/role', param('id').isMongoId(), body('role').isIn(['user', 'admin']), async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

  try {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ error: 'not found' })
    user.role = req.body.role
    await user.save()
    return res.json({ message: 'role updated' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'internal error' })
  }
})

// GET /api/admin/todos - list all todos
router.get('/todos', async (req, res) => {
  try {
    const todos = await Todo.find().populate('user', 'username email')
    return res.json(todos)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'internal error' })
  }
})

module.exports = router
