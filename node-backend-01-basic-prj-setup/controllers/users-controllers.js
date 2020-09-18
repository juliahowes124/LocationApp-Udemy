const HttpError = require('../models/http-error');
const { v4: uuid } = require('uuid');
const { validationResult } = require('express-validator');
const User = require('../models/user');


const getUsers = async (req, res, next) => {
    let users;
    try {
        users = await User.find({}, '-password');
    } catch(err) {
        const error = new HttpError('Could not fetch users', 500);
        return next(error);
    }

    res.json({users: users.map(user => user.toObject({ getters: true }))});
};

const signUp = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new HttpError('Invalid inputs passed, please check your data', 422);
        return next(error);
    }
    const { name, email, password} = req.body;

    let existingUser;
    try {
        existingUser = await User.findOne({ email: email })
    } catch (err) {
        const error = new HttpError('Registering failed, please try again later', 500);
        return next(error);
    }

    if (existingUser) {
        const error = new HttpError('User already exists, please login instead.', 422);
    }
    
    const createdUser = new User({
        name,
        email,
        image: 'https://live.staticflickr.com/7631/26849088292_36fc52ee90_b.jpg',
        password,
        places: []
    });

    try {
        await createdUser.save();
    } catch (err) {
        const error = new HttpError('Registration failed.', 500);
        console.log(err);
        return next(error);
    }
    

    res.status(201).json({user: createdUser.toObject({ getters: true })});
};

const login = async (req, res, next) => {
    const { email, password } = req.body;

    let existingUser;
    try {
        existingUser = await User.findOne({ email: email })
    } catch (err) {
        const error = new HttpError('Login failed, please try again later', 500);
        return next(error);
    }

    if (!existingUser || existingUser.password !== password) {
        const error = new HttpError('Invalid credentials, could not login', 401);
        return next(error);
    }

    res.json({message: 'Logged in!'});
};

exports.getUsers = getUsers;
exports.signUp = signUp;
exports.login = login;