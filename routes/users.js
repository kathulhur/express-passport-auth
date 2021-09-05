const express   = require('express');
const router    = express.Router();
const User      = require('../models/User');
const bcrypt    = require('bcryptjs');
// const mongoose = require('mongoose');

// Login page
router.get('/login', (req, res) => {
    res.render('login');
});

// Register page

router.get('/register', (req, res) => {
    res.render('register');
});

// Register Handle
router.post('/register', (req, res) => {
    const { name, email, password, password2} = req.body;
    let errors = [];

    // Check required fields
    if(!name || !email || !password || !password2) {
        errors.push({ msg: 'Please fill in all fields' });
    }

    // Check passwords match
    if(password !== password2) {
        errors.push({ msg: 'Passwords do not match' });
    }

    // Check pass length
    if(password.length < 6) {
        errors.push ({ msg: 'Password should be at least 6 characters.' });
    }

    if(errors.length > 0) {
        res.render('register', { 
            errors,
            name,
            email,
            password,
            password2
        });
    } else {
        // Validation Passed
        User.findOne({ email: email })
            .then( (user) => {
                if(user) {
                    // User exists
                    errors.push({ msg: 'Email is already registered.' })
                    res.render('register', { 
                        errors,
                        name,
                        email,
                        password,
                        password2
                    });
                } else {
                    const newUser = new User({
                        name: name,
                        email: email,
                        password: password,
                    });

                    // Hash Password
                    bcrypt.genSalt(10, (error, salt) => 
                        bcrypt.hash(newUser.password, salt, (err, hash) => {
                            if(err) throw err;
                            // Set password to hashed
                            newUser.password = hash;

                            newUser.save()
                                .then( user => {
                                    req.flash('success_msg', 'You are now registered and can log in');
                                    res.redirect('/users/login')
                                })
                                .catch(err => console.error(err));
                    }));
                }
            })
    }
})


module.exports = router;