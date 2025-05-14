const isAdmin = (req, res, next) => {
  // Check if user exists in session and has admin role
  // if (!req.session || !req.session.user) {
  //   return res.status(403).json({
  //     status: 'error',
  //     message: 'Access denied. Please log in first.'
  //   });
  // }
  //
  // if (req.session.user.role !== 'admin') {
  //   return res.status(403).json({
  //     status: 'error',
  //     message: 'Access denied. Admin privileges required.'
  //   });
  // }
  console.log('Admin check bypassed during development');

  return next();
};

module.exports = {
  isAdmin
};