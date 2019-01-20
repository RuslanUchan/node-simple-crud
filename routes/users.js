const express = require('express')
const router = express.Router()
const { check, validationResult } = require('express-validator/check')
const bcrypt = require('bcryptjs')
const passport = require('passport')

// Bring in User model
let UserModel = require('../models/userModel')


// Routes
// Get Register page route : GET - Clicking register button
router.get('/register', (req, res) => {
  res.render('register')
})

// Submit Register form route : POST - Clicking submit on register form
router.post('/register', [
  // Set some rules with Express validator
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Email is required').not().isEmpty(),
  check('email', 'Email is not valid').isEmail(),
  check('username', 'Username is required').not().isEmpty(),
  check('password')
    .isLength({ min: 4 })
    .custom((value, { req }) => {
    if (value !== req.body.confirm_password) {
      // Throw error if password doesnt match
      throw new Error('Password confirmation does not match')
    } else {
      return value
    }
  })

], (req, res) => {
  const name = req.body.name
  const email = req.body.email
  const username = req.body.username
  const password = req.body.password

  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    // Re-render the page and pass in the errors
    res.render('register', {
      errors: errors.array()
    })
  } else {
    // Create new user
    let newUser = new UserModel({
      name: name,
      email: email,
      username: username,
      password: password,
    })

    // Hash the password
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(newUser.password, salt, (err, hash) => {
        if (err) {
          console.log(err)
        }
        newUser.password = hash

        // Save the new registered user
        newUser.save((err) => {
          if (err) {
            console.log(err)
            return
          } else {
            req.flash('success', 'You are now registered and can log in')
            res.redirect('/users/login')
          }
        }) // Save
      }) // Hash
    }) // Salt
  } // Else not caught validation error
})

// Login route : GET - Redirected from register or clicking login
router.get('/login', (req, res) => {
  res.render('login')
})

// Login process : POST - Process logging in user w/ credentials
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next)
})

// Logout process : GET - Logout the user
router.get('/logout', (req, res) => {
  req.logout()
  req.flash('success', 'You are logged out')
  res.redirect('/users/login')
})

module.exports = router