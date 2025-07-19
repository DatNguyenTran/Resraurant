const mongoose = require('mongoose');
const { Schema } = mongoose;

const RestaurantInforSchema = new Schema({
  restaurantName: { type: String, required: true },
  address: { type: String, required: false },
  openingHours: { type: Date, required: false },
  closingHours: { type: Date, required: false },
  openingDay: { type: String, required: false },
  closingDay: { type: String, required: false },
  bannerUrl: { type: String },
  hotline: { type: String, required: false },
  email: { type: String, required: false },
  social: [{ type: String }],
  graphicTable: { type: String, required: false },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  bankInfo: {
    accountName: { type: String, required: true },
    accountNo: { type: String, required: true },
    bankCode: { type: String, required: true }
  },
});

module.exports = mongoose.model('RestaurantInfor', RestaurantInforSchema);

