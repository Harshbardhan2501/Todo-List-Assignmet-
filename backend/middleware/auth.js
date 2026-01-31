const jwt = require('jsonwebtoken')

module.exports = (jwtSecret) => {
  return (req, res, next) => {
    // support token in Authorization header (Bearer) or HttpOnly cookie named 'token' or 'jwt'
    let token = null
    const auth = req.headers.authorization
    if (auth && auth.startsWith('Bearer ')) {
      token = auth.split(' ')[1]
    } else if (req.headers && req.headers.cookie) {
      // simple cookie parser to avoid extra dependency
      const cookies = req.headers.cookie.split(';').map(c => c.trim())
      for (const c of cookies) {
        if (c.startsWith('token=')) { token = decodeURIComponent(c.split('=')[1]); break }
        if (c.startsWith('jwt=')) { token = decodeURIComponent(c.split('=')[1]); break }
      }
    }

    if (!token) return res.status(401).json({ error: 'missing token' })

    try {
      const payload = jwt.verify(token, jwtSecret)
      req.user = payload
      next()
    } catch (err) {
      return res.status(401).json({ error: 'invalid token' })
    }
  }
}
