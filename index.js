const express = require('express'),
      app = express(),
      helmet = require('helmet'),
      bodyParser = require('body-parser'),
      mongoose = require('mongoose'),
      utils = require('./public/javascript/utils'),
      morgan = require('morgan'),
      expressSanitizer = require('express-sanitizer'),
      passport = require('passport'),
      LocalStrategy = require('passport-local'),
      session = require('express-session'),
      MongoStore= require('connect-mongo')(session),
      User = require('./models/user'),
      Post = require('./models/post'),
      postRoute = require('./routes/post');

mongoose.connect('mongodb://techexplained:thaonguyen2604@ds121225.mlab.com:21225/tech_explained');

app.use(session({
    secret: "heymanidontgiveafuck",
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({
      url: 'mongodb://techexplained:thaonguyen2604@ds121225.mlab.com:21225/tech_explained',
      ttl: 60,
      autoRemove: 'interval',
      autoRemoveInterval: 60 // In minutes. Default
    })
}));

app.use(helmet());
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('combined'));
app.use(expressSanitizer());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use('/', postRoute);

// const isLoggedIn = (req, res, next) => {
//   if (req.isAuthenticated()) {
//     return next();
//   }
//   res.redirect('/login');
// };

// app.get('/', function(req, res) {
//   res.redirect('/posts');
// });

// app.get('/about', function(req, res) {
//   res.render('about.ejs');
// });

// app.get('/posts', function(req, res) {
//   Post.find({}, function(err, foundPosts) {
//     if (err) {
//       console.log(err);
//     } else {
//       res.render('index', {
//         posts: foundPosts,
//         formatDate: utils.formatDate
//       });
//     }
//   });
// });

// app.get('/posts/new', isLoggedIn, (req, res) => {
//   res.render('new');
// });

// app.post('/posts', isLoggedIn, (req, res) => {
//   const title = req.sanitize(req.body.title);
//   const category = req.sanitize(req.body.category);
//   const content = req.sanitize(req.body.content);
    
//   const new_post = {
//     title: title,
//     category: category,
//     content: content,
//     timestamp: Date.now(),
//     tags: ''
//   };
    
//   Post.create(new_post, (err, post) => {
//     if (err) {
//       console.log(err);
//     } else {
//       res.redirect('/posts');
//     }
//   });
// });

// app.get('/posts/:id', function(req, res) {
//   Post.findById(req.params.id, function(err, foundPost) {
//     if (err) {
//       console.log(err);
//     } else {
//       res.render('show', {
//         post: foundPost,
//         formatDate: utils.formatDate
//       });
//     }
//   });
// });

// app.get('/login', function(req, res) {
//   res.render('login');
// });

// app.post('/login', passport.authenticate('local', {
//   successRedirect: '/posts/new',
//   failureRedirect: '/login'
// }), (req, res) => {
// });

// app.get('/logout', (req, res) => {
//   req.logout();
//   res.redirect('/');
// });


app.get('/search', (req, res) => {
  console.log(req.query.searchQuerry);
  Post.find({ $text: { $search: req.query.searchQuerry } },
    { score : { $meta: 'textScore' } }
  ).sort( { score: { $meta: "textScore" } })
  .exec((err, foundPosts) => {
    if (err) {
      console.log(err);
    } else {
      res.render('search_result', {
        posts: foundPosts,
        formatDate: utils.formatDate
      });
    }
  });
});

app.listen(process.env.PORT, process.env.IP, function() {
  console.log('Server has started!');
});


// app.get('/register', (req, res) => {
//   res.render('register');
// });

// app.post('/register', (req, res) => {
//   User.register(new User({
//     username: req.body.username
//   }), req.body.password, (err, user) => {
//     if (err) {
//       console.log(err);
//       return res.render('/register');
//     } else {
//       passport.authenticate('local')(req, res, () => {
//         res.render('new');
//       });
//     }
//   });
// });