const mongoose = require('mongoose');

const PostSchema = mongoose.Schema({
  userId: {
    type: String,
    require: true,
  },
  desc: {
    type: String,
    max: 200,
  },
  img: {
    type: String,
  },
  likes: {
    type: Array,
    default: [],
  }, 
},
{ timestamps: true }
);

module.exports = mongoose.model('Post', PostSchema);
