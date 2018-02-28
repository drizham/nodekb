const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');


mongoose.connect('mongodb://localhost/nodekb');
let db = mongoose.connection;

// Check connection
db.once('open', function(){
  console.log('Connected to MongoDB');
});

// Check for DB errors
// register an event listener for event from db object
db.on('error', function(error){
  console.log(err);
});

// Init App object - effectively the API
const app = express();

// Bring in Models (another import really)
let Article = require('./models/article');

// Load View Engine - all to do with rendering with pug
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Body Parser Middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false}))
// parse application/json
app.use(bodyParser.json())

// Set Public Folder
// For Bower (another type of package manager for front end)
// Setting permissions to access the public folder
app.use(express.static(path.join(__dirname, 'public')));

// Middleware for Express Sessions https://github.com/expressjs/session
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}))

// Express Messages Middleware https://github.com/expressjs/express-messages
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Express Validator Middleware - copied from tutorial as cant find from:
//https://github.com/ctavan/express-validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
    var namespace = param.split('.')
    , root = namespace.shift()
    , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg : msg,
      value : value
    };
  }
}));

// Home Route
app.get('/', function(req, res){
  Article.find({}, function(err, articles){
    if(err){
      console.log(err);
    } else {
      res.render('index', {
        title: 'Articles',
        articles: articles
      });
    }

  });

});

// Route Files
let articles = require('./routes/articles');
app.use('/articles', articles);

app.listen(3000, function(){
  console.log('Server started on port 3000...')

})
