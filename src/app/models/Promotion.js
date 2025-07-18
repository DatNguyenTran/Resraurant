const mongoose = require('mongoose');
const { Schema } = mongoose;

const PromotionSchema = new Schema({
  image: { type: String, required: true },
  namePromotion: { type: String, required: true },
  description: { type: String, required: true },
  discount: { type: Number, required: true },
  applyTo: [{type: mongoose.Schema.Types.ObjectId, ref: 'CategoryFood', required: true}],
  startDate: { type: Date, required: true, default: Date.now },
  endDate: { type: Date, required: true },
});

module.exports = mongoose.model('Promotion', PromotionSchema);
