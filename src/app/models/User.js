const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    firstName: { type: String, required: false },
    lastName: { type: String, required: false },
    password: { type: String, required: true },
    phoneNumber: { type: String, required: false },
    email: { type: String, required: true },
    address: { type: String, required: false },
    gender: { type: Boolean, required: false },
    avatar: {
      type: String,
      default:
        "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg",
    },
    role: {
      type: String,
      enum: ["RESOWNER", "RESMANAGER", "WAITER", "KITCHENSTAFF", "CUSTOMER", "ADMIN"],
      required: true,
    },
    status: { type: String, enum: ["ACTIVE", "INACTIVE"], required: true },
    provider: { type: String, default: "local" },
    googleId: { type: String, unique: true, sparse: true },
    resetToken: { type: String, required: false },
    resetTokenExpiration: { type: Date, required: false },
    subscription: {
      type: new Schema(
        {
          type: {
            type: String,
            enum: ["TRIAL", "MONTHLY", "YEARLY", "EXPIRED"],
            default: "TRIAL",
          },
          trialEnd: Date,      // nếu là trial
          startedAt: Date,     // nếu là paid
          expiredAt: Date
        },
        { _id: false } // Không cần _id cho subdocument
      ),
      default: () => ({})
    },
    restaurant: {
      type: Schema.Types.ObjectId,
      ref: "RestaurantInfor"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
