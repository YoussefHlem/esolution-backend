const mongoose = require('mongoose');

const DownloadSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  pdfAttachment: { type: String, required: true },
  tag: { 
    type: String, 
    enum: ['brochure', 'flyers', 'technical'],
    required: true 
  }
}, { timestamps: true });

module.exports = mongoose.model('Download', DownloadSchema);
