const jwt = require('jsonwebtoken')
const jwtSecret = 'MonkasczI69'

module.exports = (req, res, next) => {
  try {
    jwt.verify(req.headers.authorization, jwtSecret)
    next()
  } catch (err) {
    res.status(401).json({
      message: 'Auth failed',
    })
  }
}
