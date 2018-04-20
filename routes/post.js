const express = require('express'),
      utils = require('../public/javascript/utils'),
      Post = require('../models/post'),
      passport = require('passport');

const route = express.Router();

route.use((req, res, next) => {
  console.log('There comes a request');
  next();
});

const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
};

route.get('/', (req, res) => {
  res.redirect('/posts');
});

route.get('/posts', function(req, res) {
  Post.find({}, function(err, foundPosts) {
    if (err) {
      console.log(err);
    } else {
      res.render('index', {
        posts: foundPosts,
        formatDate: utils.formatDate
      });
    }
  });
});

route.get('/about', function(req, res) {
  res.render('about.ejs');
});

route.post('/posts', isLoggedIn, (req, res) => {
  const title = req.sanitize(req.body.title);
  const category = req.sanitize(req.body.category);
  const content = req.sanitize(req.body.content);
    
  const new_post = {
    title: title,
    category: category,
    content: content,
    timestamp: Date.now(),
    tags: ''
  };
    
  Post.create(new_post, (err, post) => {
    if (err) {
      console.log(err);
    } else {
      res.redirect('/posts');
    }
  });
});

route.post('/posts', isLoggedIn, (req, res) => {
  const title = req.sanitize(req.body.title);
  const category = req.sanitize(req.body.category);
  const content = req.sanitize(req.body.content);
    
  const new_post = {
    title: title,
    category: category,
    content: content,
    timestamp: Date.now(),
    tags: ''
  };
    
  Post.create(new_post, (err, post) => {
    if (err) {
      console.log(err);
    } else {
      res.redirect('/posts');
    }
  });
});

route.get('/posts/new', isLoggedIn, (req, res) => {
  res.render('new');
});

route.get('/posts/:id', function(req, res) {
  Post.findById(req.params.id, function(err, foundPost) {
    if (err) {
      console.log(err);
    } else {
      res.render('show', {
        post: foundPost,
        formatDate: utils.formatDate
      });
    }
  });
});

route.get('/login', function(req, res) {
  res.render('login');
});

route.post('/login', passport.authenticate('local', {
  successRedirect: '/posts/new',
  failureRedirect: '/login'
}), (req, res) => {
});

route.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

module.exports = route;