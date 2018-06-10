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
      postRoute = require('./routes/post'),
      nconf = require('nconf');

nconf.argv().env().file('keys.json');
const user = nconf.get('mongoUser');
const pass = nconf.get('mongoPass');
const host = nconf.get('mongoHost');
const port = nconf.get('mongoPort');
const uri = `mongodb://${user}:${pass}@${host}:${port}/${nconf.get('mongoDatabase')}`
console.log(uri)
mongoose.connect(uri);

app.use(session({
    secret: "heymanidontgiveafuck",
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({
      url: uri,
      ttl: 24 * 60 * 60,
      autoRemove: 'interval',
      autoRemoveInterval: 600 // In minutes. Default
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
  let currentPage;
  const postCount = 5;
  if (req.query.page) {
    currentPage = Number(req.query.page) - 1;
  } else {
    currentPage = 0;
  }
  Post.find({ $text: { $search: req.query.searchQuerry } },
    { score : { $meta: 'textScore' } }
  ).sort( { score: { $meta: "textScore" } })
  .exec((err, foundPosts) => {
    if (err) {
      console.log(err);
    } else {
      const previousPage = currentPage > 0 ? currentPage : null;
      const nextPage = (currentPage + 1) * postCount < foundPosts.length ? currentPage + 2 : null;
      res.render('index', {
        posts: foundPosts.slice(currentPage * postCount, (currentPage + 1) * postCount),
        formatDate: utils.formatDate,
        currentPage: currentPage + 1,
        previousPage: previousPage,
        nextPage: nextPage
      });
    }
  });
});

app.listen(process.env.PORT || 8080, process.env.IP, function() {
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
