const { verifyAccessToken } = require('../utils/jwt');

/**
 * Middleware to authenticate JWT token
 */
const authenticateUser = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Access token missing or invalid.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded; // { id, email, role, employeeId }
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
    }
    return res.status(401).json({ success: false, message: 'Invalid access token.' });
  }
};

/**
 * Middleware to authorize specific roles
 * @param {...string} roles - Allowed roles
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to perform this action.',
      });
    }
    next();
  };
};

/**
 * Middleware to ensure employee can only access their own data
 */
const authorizeOwnerOrAdmin = (req, res, next) => {
  const { role, employeeId } = req.user;
  const requestedId = req.params.employeeId || req.params.id;

  if (role === 'admin' || role === 'hr') {
    return next();
  }

  if (employeeId === requestedId) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'You are not authorized to access this resource.',
  });
};

module.exports = { authenticateUser, authorizeRoles, authorizeOwnerOrAdmin };
