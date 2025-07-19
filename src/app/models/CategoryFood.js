const mongoose = require('mongoose');
const { Schema } = mongoose;

const CategoryFoodSchema = new Schema({
  categoryName: { type: String, required: true },
  description: { type: String, required: false },
  imageUrl: { type: String, required: false},
});

module.exports = mongoose.model('CategoryFood', CategoryFoodSchema);
