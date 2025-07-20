const mongoose = require('mongoose');
const { Schema } = mongoose;

const FeedbackStaffSchema = new Schema({
  message: { type: String, required: true },
  rating: { type: Number, required: true },
  customer: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
  waiter: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Feedback', FeedbackStaffSchema);

