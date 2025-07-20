const mongoose = require('mongoose');
const { Schema } = mongoose;

const StaffInforSchema = new Schema({
    salary: { type: Number, required: true },
    rate: { type: Number, required: true },
    staff: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
});

module.exports = mongoose.model('StaffInfor', StaffInforSchema);

