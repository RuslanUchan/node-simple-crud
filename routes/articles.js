const express = require('express')
const router = express.Router()
const { check, validationResult } = require('express-validator/check')


// Bring in Article models
const ArticleModel = require('../models/articleModel')

// Bring in User models
const UserModel = require('../models/userModel')

// Grab everything that has article/ routes into this file

// Add Articles route : GET - HTML Form
router.get('/add', ensureAuthenticated, (req, res) => {
  res.render('add_article', {
    title: 'Add Articles'
  })
})

// Add Articles route : POST - Submitted Form
router.post('/add', [
  // Set some rules with Express validator
  check('title').not().isEmpty().withMessage('Title is required'),
  // check('author').not().isEmpty().withMessage('Author is required'),
  check('body').not().isEmpty().withMessage('Body is required')
], (req, res) => {
  // Finds the validation errors in this request and 
  // wraps them in an object with handy functions
  
  // Get errors if any
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    // Re-render the page and pass in the errors
    res.render('add_article', {
      title: 'Add Articles',
      errors: errors.array()
    })
  } else {
    let article = new ArticleModel()
    article.title = req.body.title
    article.author = req.user._id
    article.body = req.body.body

    article.save(err => {
      if (err) {
        console.log(err)
        return
      } else {
        req.flash('success', 'Article Added')
        res.redirect('/')
      }
    })
  }
})

// Get single article route : GET - Clicking title
router.get('/:id', (req, res) => {
  ArticleModel.findById(req.params.id, (err, article) => {
    UserModel.findById(article.author, (err, user) => {
      res.render('article', {
        article: article,
        author: user.name
      })
    })
  }) 
})

// Update single article route : GET - Clicking edit button
router.get('/edit/:id', ensureAuthenticated, (req, res) => {
  ArticleModel.findById(req.params.id, (err, article) => {
    // If someone tries to edit the articles not their own
    if (article.author != req.user._id) {
      req.flash('danger', 'Not Authorized')
      res.redirect('/')
      return
    }

    res.render('edit_article', {
      title: 'Edit Article',
      article: article
    })
  }) 
})

// Update Article route : POST - Submit edit article
router.post('/edit/:id', (req, res) => {
  let article = {}
  article.title = req.body.title
  article.author = req.body.author
  article.body = req.body.body

  // Match the id to the edited id in the url
  let query = {_id: req.params.id}

  // Update via the model. Pass in query, article to update
  ArticleModel.updateOne(query, article, err => {
    if (err) {
      console.log(err)
      return
    } else {
      req.flash('success', 'Article Updated')
      res.redirect('/')
    }
  })
})

// Delete Article route : DELETE - Clicking delete button
router.delete('/:id', (req, res) => {
  if (!req.user._id) res.status(500).send()
  
  let query = {_id: req.params.id}

  ArticleModel.findById(req.params.id, (err, article) => {
    if (article.author !== req.user._id) {
      res.status(500).send()
    }
    ArticleModel.deleteOne(query, err => {
      if (err) {
        console.log(err)
      }
      // Send back a response because we send the request from main.js
      res.send('Success')
    }
  )}
)})

// Access Control
// This access control function could be added to any route
// to ensure that the user is authenticated before accessing
// the route.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }

  req.flash('danger', 'Please login')
  res.redirect('/users/login')
}

module.exports = router