// Putting all the routes here
// All routing happens from here

const express = require('express');
const router = express.Router();

// Bring in Article Models
let Article = require('../models/article') // note the double dot
// Bring in User Models
let User = require('../models/user') // give access to user object

// Add Route
router.get('/add', ensureAuthenticated, function(req, res){
  res.render('add_article', {
    title:'Add Article'
  });
});

// Add Submit POST Route
router.post('/add', function(req, res){
  // Checks for the submission fields
  req.checkBody('title', 'Title is required').notEmpty();
  //req.checkBody('author', 'Author is required').notEmpty();
  req.checkBody('body', 'Author is required').notEmpty();

  // Get Errors
  let errors = req.validationErrors();

  if(errors){
    res.render('add_article', {
      title:'Add Article', // must as else label will be blank
      errors:errors
    });
  } else {
    let article = new Article();
    article.title = req.body.title;
    article.author = req.user._id; // get user id from the user object
    article.body = req.body.body;

    article.save(function(err){
      if(err){
        console.log(err);
        return;
      } else {
        req.flash('success', 'Article Added')
        res.redirect('/');
      }
    });
  }
});

// Load Edit Form
router.get('/edit/:id', ensureAuthenticated, function(req, res){
  Article.findById(req.params.id, function(err, article){
    if (article.author != req.user._id){
      req.flash('danger', 'Not Authorized');
      res.redirect('/'); // redirect to home page
    }
    res.render('edit_article', {
      title:'Edit Article',
      article:article
    });
  });
});

// Update Submit POST Route
// technically not posting but putting
router.post('/edit/:id', function(req, res){
  let article = {}; // setting to emplty object
  article.title = req.body.title;
  article.author = req.body.author;
  article.body = req.body.body;

  let query = {_id:req.params.id}

  Article.update(query, article, function(err){
    if(err){
      console.log(err);
      return;
    } else {
      res.redirect('/');
    }
  });
});

// a whole load of AJAX etc just for the delete, watch part 7 for details
router.delete('/:id', function(req, res){
  if(!req.user._id){
    res.status(500).send(); // failure status
  }

  let query = {_id:req.params.id}

  Article.findById(req.params.id, function(err, article){
    if(article.author != req.user._id){
      res.status(500).send();
    } else{
      Article.remove(query, function(err){
        if(err){
          console.log(err);
        }
        res.send('Success')
      })
    }
  })
})

// Get Single Article
router.get('/:id', function(req, res){
  Article.findById(req.params.id, function(err, article){
    User.findById(article.author, function(err, user){
      res.render('article', {
        article:article,
        author:user.name
      })
    });
  })
})

// Access Control
function ensureAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    return next();
  } else {
    req.flash('danger', 'Please login you cunt');
    res.redirect('/users/login');
  }
}

// to be able to access the module from the outside
module.exports = router;
