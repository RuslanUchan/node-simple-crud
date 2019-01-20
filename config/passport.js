const LocalStrategy = require('passport-local').Strategy
const UserModel = require('../models/userModel')
const config = require('./db')
const bcrypt = require('bcryptjs')

module.exports = function(passport) {
  // Local strategy
  passport.use(new LocalStrategy(
    (username, password, done) => {
      UserModel.findOne({ username: username }, (err, user) => {
        if (err) { return done(err); }
        if (!user) {
          return done(null, false, { message: 'Incorrect username.' })
        }

        // Match password
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) throw err

          if (isMatch) {
            return done(null, user) // Pass user data if match
          } 
          
          return done(null, false, { message: 'Incorrect password.' })
          
        })
      }) // Findone
    } // Localstrategy callback
  )) // Passport

  // Serialize user
  passport.serializeUser((user, done) => {
    done(null, user.id)
  })
  
  passport.deserializeUser((id, done) => {
    UserModel.findById(id, (err, user) => {
      done(err, user)
    })
  })
}