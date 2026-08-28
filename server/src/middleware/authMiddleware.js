const jwt = require('jsonwebtoken');
const inMemoryStore = require('../store/inMemoryStore');

const JWT_SECRET = process.env.JWT_SECRET || 'campus_resolve_super_secret_jwt_key_2026_!#';

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no session token provided'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await inMemoryStore.findUserById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.'
      });
    }

    // Attach user to request object (exclude password)
    const { password, ...safeUser } = user;
    req.user = safeUser;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, invalid or expired token'
    });
  }
};

module.exports = {
  protect,
  JWT_SECRET
};
