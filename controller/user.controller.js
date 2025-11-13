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

module.exports.getAllusers = async (req,res)=>{
    try{

        // for Filtering, Sorting and Pagination
        const queryObject = {...req.query};
        const excludeFields = ['page', 'sort', 'limit', 'fields'];
        excludeFields.forEach(field => delete queryObject[field]);

        // for advanced filtering
        let queryStr = JSON.stringify(queryObject);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

// Query   
        let query = userModel.find(JSON.parse(queryStr));

        // for field limiting
        if(req.query.sort){
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            query = query.sort('-createdAt');
        }

        if(req.query.fields){
            const fields = req.query.fields.split(',').join(' ');
            query = query.select(fields);
        } else {
            query = query.select('-__v');
        }

        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;
        query = query.skip(skip).limit(limit);

        if(req.query.page){
            const totalUsers = await userModel.countDocuments();
            if(skip >= totalUsers){
                throw new Error('This page does not exist');
            }
        }


// Execute query
        const users = await query;
        res.status(200).json({ message: 'Users retrieved successfully', users });
    }
    catch(error){
        res.status(500).json({ message: 'Server error during user retrieval', error: error.message });
    }
}