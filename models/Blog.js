const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  body: { type: String, required: true },
  image: { type: String, required: true },
  createdFrom: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Blog', BlogSchema);