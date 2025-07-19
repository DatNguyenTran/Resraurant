const mongoose = require('mongoose');
const { Schema } = mongoose;

const paymentsSchema = new Schema({
  orderId: { type: String, ref: 'Order', required: true },
  amount: { type: Schema.Types.Decimal128, required: true },
  method: { type: String, enum: ['Cash', 'Credit Card', 'Debit Card', 'Online'], required: true },
  status: { type: String, enum: ['Pending', 'Completed', 'Failed', 'Refunded'], required: true },
  paymentDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Payments', paymentsSchema);
