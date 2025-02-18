const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  birthday: { type: Date, default: null },
  phone: { type: String, default: "" },
  address: { type: String, default: "" },
  avatar: { type: String, default: "" },
});

const AccountSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    profile: { type: profileSchema, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Account", AccountSchema);
