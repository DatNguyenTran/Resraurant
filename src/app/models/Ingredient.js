const mongoose = require("mongoose");

const ingredientSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  quantity:    { type: Number, required: true, default: 0 },
  unit:        { type: String, required: true },      
  note:        { type: String, default: "" },       
  createdAt:   { type: Date,   default: Date.now },
  updatedAt:   { type: Date,   default: Date.now },
  restaurant:  { type: mongoose.Schema.Types.ObjectId, ref: 'RestaurantInfor', required: true },
});

ingredientSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Ingredient", ingredientSchema);
