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
  res.redirect('/');
};

route.get('/', (req, res) => {
  res.redirect('/posts');
});

route.get('/posts', function(req, res) {
  let currentPage;
  const postCount = 5;
  if (req.query.page) {
    currentPage = Number(req.query.page) - 1;
  } else {
    currentPage = 0;
  }
  Post.find({}, function(err, foundPosts) {
    foundPosts = foundPosts.sort((a, b) => b.timestamp - a.timestamp);
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

route.get('/about', function(req, res) {
  res.render('about.ejs');
});

route.post('/posts', isLoggedIn, (req, res) => {
  const title = req.sanitize(req.body.title);
  const timestamp = Date.now();
  const url = title.toLowerCase().replace(/\s+/g, '-') + '-' + timestamp;
  const category = req.sanitize(req.body.category);
  const excerpt = req.sanitize(req.body.excerpt);
  const content = req.sanitize(req.body.content);
  const tags = req.sanitize(req.body.tags);
    
  const new_post = {
    title: title,
    url: url,
    category: category,
    excerpt: excerpt,
    content: content,
    timestamp: timestamp,
    tags: tags
  };
    
  Post.create(new_post, (err, post) => {
    if (err) {
      console.log(err);
    } else {
      res.redirect(`/posts/${post.url}`);
    }
  });
});

route.get('/posts/new', isLoggedIn, (req, res) => {
  res.render('new');
});

route.get('/posts/:url', function(req, res) {
  Post.findOne({url: req.params.url}, function(err, foundPost) {
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
