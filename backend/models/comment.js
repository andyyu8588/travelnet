const mongoose = require('mongoose');


const commentSchema = mongoose.Schema({
  date: {type: String, required: true},
  author: {type: String, required: true},
  content: {type: String, required: true},
  likes: {type: [String], default: []},
  replies: {type: [{
    date: {type: String, required: true},
    author: {type: String, required: true},
    content: {type: String, required: true},
    likes: {type: [String], default: []},
    edited: {type: [String], default: []},
  }], default: []},
  edited: {type: [String], default: []},
})
module.exports = mongoose.model('Comment', commentSchema);
