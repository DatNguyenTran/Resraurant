const mongoose = require('mongoose');

const { Schema } = mongoose;

const MenuSchema = new Schema({
  foodName: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Schema.Types.Decimal128, required: true },
  imageUrl: { type: String, required: true },
  starRating: { type: Number },
  statusFood: { type: String, enum: ["AVAILABLE", "UNAVAILABLE"], required: true },
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'RestaurantInfor', required: true },
});

module.exports = mongoose.model('Menu', MenuSchema);
