// middleware/role.js
module.exports = function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'unauthenticated' })
    if (Array.isArray(role)) {
      if (!role.includes(req.user.role)) return res.status(403).json({ error: 'forbidden' })
    } else {
      if (req.user.role !== role) return res.status(403).json({ error: 'forbidden' })
    }
    next()
  }
}
