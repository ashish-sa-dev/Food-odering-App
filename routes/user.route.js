const express = require('express');
const router = express.Router();
const userController = require('../controller/user.controller');
const userAuth = require('../middleware/user.auth');

router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.get('/profile', userAuth.authenticateUser,userAuth.authorizeUser('user'), userController.getUserProfile);
router.post('/forgot-password',userAuth.forgotPassword);
router.patch('/reset-password/:token',userAuth.resetPassword);
module.exports = router;