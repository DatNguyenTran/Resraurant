const mongoose = require("mongoose");

const subscriptionLogSchema = new mongoose.Schema({
  guestId: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  plan: { type: String, enum: ["monthly", "yearly"], required: true },
  amount: { type: Number, required: true },
  paid: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("SubscriptionLog", subscriptionLogSchema);