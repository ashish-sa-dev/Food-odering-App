const jwt = require('jsonwebtoken');
const User = require('../models/user.model');


module.exports.authenticateUser = async (req, res, next) => {
    let token;
 
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ status: 'fail', message: 'You are not logged in! Please log in to get access.' });
  }

  try {
    // 2. Verify token (checks signature and expiry)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded JWT:', decoded);

    // 3. Check if user still exists
    const freshUser = await User.findById(decoded._id);
    if (!freshUser) {
      return res.status(401).json({ status: 'fail', message: 'The user belonging to this token no longer exists.' });
    }
    req.user = freshUser; 
    next();
  } catch (err) {
   
    res.status(401).json({ message: 'Invalid or expired token.', error: err.message });
  }
};
