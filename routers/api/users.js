const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const User = require('../../models/Users');
const jwt = require('jsonwebtoken');
const key = require('../../config/keys');
const passport = require('passport');

const validateRegisteration = require('../../validation/register');
const validateLogin = require('../../validation/login');

// @route GET api/users/test
// @desc Test User route
// @access Public
// router.get('/test', (req, res) =>
//     res.json({ msg: "test user" })
// );

// @route GET api/users/register
// @desc new user registration route
// @access Public
router.post('/register', (req, res) => {
    const { errors, isValid } = validateRegisteration(req.body);
    // console.log(isValid);
    if (!isValid) {
        return res.status(400).json(errors);
    }
    User.findOne({ email: req.body.email })
        .then(data => {
            // set errors in errors object
            errors.email = "Email already exists";
            if (data) {
                // res.json({ email: "Email already exists" })
                return res.status(400).json(errors);
            } else {

                // gravatar img section as default
                const avatar = gravatar.url(req.body.email, {
                    s: '200', // Size
                    r: 'pg', // Rating
                    d: 'mm' // Default
                })

                // create a new User object
                const newUser = new User({
                    name: req.body.name,
                    email: req.body.email,
                    avatar: avatar,
                    password: req.body.password,
                })

                // encrypt pwd and save user data in DB
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        newUser.password = hash;
                        newUser.save()
                            .then(user => {
                                res.json({ user: user })
                            })
                            .catch(err => console.log(err))
                    })
                })

            }
        })
        .catch(err => res.status(404).json(err))
});


// @route GET api/users/login
// @desc existing user login route
// @access Public
router.post('/login', (req, res) => {
    const { errors, isValid } = validateLogin(req.body);
    // console.log(isValid);
    if (!isValid) {
        return res.status(400).json(errors);
    }
    const email = req.body.email;
    const password = req.body.password;
    User.findOne({ email })
        .then(data => {
            if (data) {
                bcrypt.compare(password, data.password)
                    .then(isMatch => {
                        if (isMatch) {
                            const payload = { id: data.id, email: data.email, name: data.name,avatar:data.avatar };
                            jwt.sign(
                                payload,
                                key.keyorSecret,
                                { expiresIn: 3600 },
                                (err, token) => {
                                    if(err) throw err;
                                    res.json({ success: true, token: 'Bearer ' + token })
                                }
                            )
                            // res.json({ msg: `Welcome ${data.name}` });
                        } else {
                            errors.password = "Incorrect Password";
                            // return res.status(400).json({ msg: "Incorrect Password" });
                            return res.status(400).json(errors);
                        }
                    })
            } else {
                errors.email = "User Not exists";
                res.json(errors);
            }
        })
        .catch(err => res.status(404).json(err))
});

// @route GET api/users/current
// @desc current user data route
// @access Private
router.get('/current', passport.authenticate('jwt', { session: false }), (req, res) => {
    // console.log(req.user);
    res.json({ id: req.user.id, name: req.user.name, email: req.user.email })
})
module.exports = router; 