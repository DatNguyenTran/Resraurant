const mongoose = require('mongoose');
const { Schema } = mongoose;

const FeedbackFoodSchema = new Schema({
  message: { type: String, required: true },
  rating: { type: Number, required: true },
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
  menu: {type: mongoose.Schema.Types.ObjectId, ref: 'Menu', required: true},
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Feedback', FeedbackFoodSchema);

