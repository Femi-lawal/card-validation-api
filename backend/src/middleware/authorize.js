const jwt = require('jsonwebtoken');

/**
 * JWT-based authorization middleware
 * Validates JWT tokens or falls back to legacy token/client auth for backwards compatibility
 */
const authorize = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Try JWT authentication first (preferred)
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-key');
      req.user = decoded;
      return next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
  }

  // Fall back to legacy static token authentication for backwards compatibility
  const token = req.headers['token'];
  const client = req.headers['client'];

  const validToken = process.env.ACCESS_TOKEN || '8234d078-e3ab-479e-a20e-89eb4dd0133f';
  const validClient = process.env.CLIENT || '3W6izon01E77goCGve8pHA';

  if (token === validToken && client === validClient) {
    return next();
  }

  res.status(401).json({ success: false, message: 'Unauthorized - Valid Bearer token or token/client headers required' });
};

module.exports = authorize;
