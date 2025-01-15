const mongoose = require('mongoose');

const EquipmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  qty: { type: Number, required: true, min: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Equipment', EquipmentSchema);
