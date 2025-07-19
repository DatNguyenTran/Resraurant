const mongoose = require("mongoose");
const { Schema } = mongoose;

const orderSchema = new Schema({
  dishes: [
    {
      menuItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Menu",
        required: true,
      },
      quantity: { type: Number, required: true },
      statusOrder: {
        type: String,
        enum: ["Pending", "In Progress", "Completed", "Cancelled", "Hidden"],
        required: true,
      },
      typeOrder: { type: String, enum: ["Offline", "Online"], required: true },
      orderDate: { type: Date, default: Date.now },
    },
  ],
  table: { type: mongoose.Schema.Types.ObjectId, ref: "Table", required: true },
  bookingTable: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BookingTable",
    required: false,
  },
  totalPrice: { type: Number, required: false },
  statusPayment: {
    type: String,
    enum: ["Pending", "Paid"],
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: ["Cash", "Card"],
    required: true,
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "RestaurantInfor",
    required: true,
  },
  session: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Order", orderSchema);