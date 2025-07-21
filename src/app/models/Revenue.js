const mongoose = require("mongoose");
const { Schema } = mongoose;
const RevenueSchema = new Schema({
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "RestaurantInfor",
    required: true,
  },
  table: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Table",
    required: true,
  },
  session: {
    type: Number,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["PAID", "CANCELLED", "PENDING"],
    default: "PENDING",
  },
});

// Index để tối ưu query theo restaurant và session
RevenueSchema.index({ restaurant: 1, session: 1 });

module.exports = mongoose.model("Revenue", RevenueSchema);
