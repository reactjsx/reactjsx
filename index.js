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
const uri = `mongodb://${user}:${pass}@${host}:${port}/${nconf.get('mongoDatabase')}`;
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
      const displayPost = foundPosts.slice(currentPage * postCount, (currentPage + 1) * postCount);
      let tags = [];
      displayPost.forEach(post => {
        if (post.tags !== '') {
	        tags = [...new Set([...tags, ...post.tags.replace(/\s*/g, '').split(',')])];
        }
      });
      res.render('index', {
        posts: displayPost,
        tags: tags,
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
