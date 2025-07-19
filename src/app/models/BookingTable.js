const mongoose = require("mongoose");
const { Schema } = mongoose;

const BookingTableSchema = new Schema({
  quantity: { type: Number, required: false },
  orderDate: { type: Date, default: Date.now },
  timeUse: { type: Number, default: 3 },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  table: { type: mongoose.Schema.Types.ObjectId, ref: "Table", required: true },
  request: { type: String, required: false },
  isPaid: { type: Boolean, default: false },
  expiresAt: { type: Date, required: true },
  deposit: { type: Number, default: 0 },
});

BookingTableSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
BookingTableSchema.pre("deleteMany", function (next) {
  if (this.getFilter().expiresAt) {
    this.getFilter().isPaid = false;
  }
  next();
});

module.exports = mongoose.model("BookingTable", BookingTableSchema);
