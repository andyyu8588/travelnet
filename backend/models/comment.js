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
    likes: { type: [String], default: []}
  }], default: []},
  edited: { type: String, default: null}
})
module.exports = mongoose.model("Comment", commentSchema);