const express = require('express')
const { body, param, validationResult } = require('express-validator')
const Todo = require('../models/Todo')

const router = express.Router()

// GET /api/todos - if admin: all todos, else: user's todos
router.get('/', async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      const todos = await Todo.find().populate('user', 'username email')
      return res.json(todos)
    }
    const todos = await Todo.find({ user: req.user.id })
    return res.json(todos)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'internal error' })
  }
})

// POST /api/todos - create todo
router.post(
  '/',
  body('title').isString().isLength({ min: 1, max: 100 }),
  body('description').optional().isString().isLength({ max: 500 }),
  body('dueDate').optional().isISO8601().toDate(),
  body('category').optional().isIn(['Urgent', 'Non-Urgent']),
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

    try {
      const { title, description, dueDate, category } = req.body
      const todo = new Todo({ title, description, dueDate, category, user: req.user.id })
      await todo.save()
      return res.status(201).json(todo)
    } catch (err) {
      console.error(err)
      return res.status(500).json({ error: 'internal error' })
    }
  }
)

// PUT /api/todos/:id - update todo (user can update own, admin any)
router.put(
  '/:id',
  param('id').isMongoId(),
  body('title').optional().isString().isLength({ min: 1, max: 100 }),
  body('description').optional().isString().isLength({ max: 500 }),
  body('dueDate').optional().isISO8601().toDate(),
  body('category').optional().isIn(['Urgent', 'Non-Urgent']),
  body('completed').optional().isBoolean(),
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

    try {
      const todo = await Todo.findById(req.params.id)
      if (!todo) return res.status(404).json({ error: 'not found' })

      // ownership check
      if (req.user.role !== 'admin' && todo.user.toString() !== req.user.id) {
        return res.status(403).json({ error: 'forbidden' })
      }

      Object.assign(todo, req.body)
      await todo.save()
      return res.json(todo)
    } catch (err) {
      console.error(err)
      return res.status(500).json({ error: 'internal error' })
    }
  }
)

// DELETE /api/todos/:id - delete todo
router.delete('/:id', param('id').isMongoId(), async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

  try {
    console.log('DELETE request for todo id:', req.params.id, 'by user:', req.user && req.user.id)
    const todo = await Todo.findById(req.params.id)
    console.log('Found todo:', todo && todo._id, 'owner:', todo && todo.user)
    if (!todo) return res.status(404).json({ error: 'not found' })

    if (req.user.role !== 'admin' && todo.user.toString() !== req.user.id) {
      return res.status(403).json({ error: 'forbidden' })
    }

    // use findByIdAndDelete to avoid potential document method issues
    const deleted = await Todo.findByIdAndDelete(req.params.id)
    if (!deleted) {
      // This is unexpected because we just found it above, but handle gracefully
      console.warn('Todo not deleted (not found on second attempt)', req.params.id)
      return res.status(500).json({ error: 'delete failed' })
    }

    return res.json({ message: 'deleted' })
  } catch (err) {
    console.error('Error deleting todo:', err && err.stack ? err.stack : err)
    return res.status(500).json({ error: 'internal error' })
  }
})

module.exports = router
