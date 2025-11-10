const userModel = require('../models/user.model');

module.exports.registerUser = async (req, res) => {
    try{
        const {fullname, email, password} = req.body;
        const existingUser = await userModel.findOne({email});
        if(existingUser){
            return res.status(400).json({message: 'User already exists'});
        }

        const hashedPassword = await userModel.hashPassword(password);
        const newUser = await userModel.create({fullname, email, password: hashedPassword});
        const token = newUser.generateAuthToken();
        res.status(201).json({message: 'User registered successfully', user: newUser, token});
    }
    catch(error){
        res.status(500).json({message: 'Server error during registration', error: error.message});
    }
} 

module.exports.loginUser = async (req, res) => {
    try{
        const {email,password} = req.body;

        const user = await userModel.findOne({email}).select('+password');
        if(!user){
            return res.status(400).json({message: 'Invalid email or password'});
        }

        const isMatch = await user.comparePassword(password);
        if(!isMatch){
            return res.status(400).json({message: 'Invalid email or password'});
        }

        const token = user.generateAuthToken();
        res.status(200).json({message: 'Login successful', user, token});
    }
    catch(error){
        res.status(500).json({message: 'Server error during login', error: error.message});
    }
}

module.exports.getUserProfile = async (req, res) => {
    console.log("authenticated user:", req.user);
    res.status(200).json({ message: 'User profile retrieved successfully', user: req.user });
}