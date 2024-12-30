const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.cookies.adminToken;
  
  if (!token) {
    return res.redirect('/admin/login');
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = verified;
    next();
  } catch (err) {
    res.redirect('/admin/login');
  }
};

module.exports = authMiddleware;
