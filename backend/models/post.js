const mongoose = require("mongoose");

var commentSchema = mongoose.Schema({
  date: { type: String, required: true},
  author: { type: String, required: true},
  content: { type: String, required: true},
  likes: { type: [String], default: []},
  replies: { type: [{
    date: { type: String, required: true},
    author: { type: String, required: true},
    content: { type: String, required: true},
    likes: { type: [String], default: []},
    edited: { type: [String], default: []},
  }], default: []},
  edited: { type: [{edit: String, date: String}], default: []}
})

const postSchema = mongoose.Schema({
  date: { type: String, required: true },
  location:{ type: String, required: true},
  author: { type: String, required: true },
  likes: { type: [String], default: [] },
  title: { type: String, required: true },
  content: { type: String, required: true },
  imagePath: { type: String, required: true },
  tags: { type: [{edit: String, date: String}], required: true},
  comments: [commentSchema]
});



module.exports = mongoose.model("Post", postSchema);
