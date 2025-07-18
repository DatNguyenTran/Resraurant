const mongoose = require("mongoose");
const { Schema } = mongoose;
const ReportStaffSchema = new Schema({
  staff: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: {
    type: String,
    enum: ["RẤT TỐT", "TỐT", "TRUNG BÌNH", "KHÔNG TỐT"],
    required: true,
  },
  details: { type: Schema.Types.Mixed, required: true },
  createdDate: { type: Date, required: true },
  updatedDate: { type: Date, required: true },
});

module.exports = mongoose.model("Reports", ReportStaffSchema);
