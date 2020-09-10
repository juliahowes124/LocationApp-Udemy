const HttpError = require('../models/http-error');
const { v4: uuid } = require('uuid');

const DUMMY_USERS = [
    {
        id: 'u1',
        name: 'Julia Howes',
        email: 'test@test.com',
        password: 'password'
    }
]

const getUsers = (req, res, next) => {
    res.json({users: DUMMY_USERS});
};

const signUp = (req, res, next) => {
    const { name, email, password } = req.body;
    const hasUser = DUMMY_USERS.find(u => u.email === email);
    if (hasUser) {
        throw new HttpError('Email already exists', 422);
    }
    const createdUser = {
        id: uuid(),
        name, 
        email,
        password
    };

    DUMMY_USERS.push(createdUser);
    res.status(201).json({user: createdUser});
};

const login = (req, res, next) => {
    const { email, password } = req.body;
    const identifiedUser = DUMMY_USERS.find(u => u.email === email);
    if (!identifiedUser || identifiedUser.password !== password) {
        throw new HttpError('Could not authenticate user', 401);
    }
    res.json({message: 'Logged in!'});
};

exports.getUsers = getUsers;
exports.signUp = signUp;
exports.login = login;