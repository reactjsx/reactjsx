const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
  title: String,
  url: String,
  timestamp: Number,
  content: String,
  excerpt: String,
  category: String,
  tags: String
});
postSchema.index({ title: 'text', content: 'text' });

module.exports = mongoose.model('Post', postSchema);
