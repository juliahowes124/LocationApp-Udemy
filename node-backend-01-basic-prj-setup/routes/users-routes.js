const express = require('express');
const { check } = require('express-validator');
const usersControllers = require('../controllers/users-controllers');
const router = express.Router();

router.get('/', usersControllers.getUsers);
router.post('/signup',
    [
        check('name').not().isEmpty(),
        check('email').normalizeEmail().isEmail(), //normalizeEmail makes Test@test.com turn to test@test.com
        check('password').isLength({ min:6 })

    ],
    usersControllers.signUp);
router.post('/login', usersControllers.login);

module.exports = router;