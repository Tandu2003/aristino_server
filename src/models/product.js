const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    image: {
      mobile: { type: String, required: true },
      desktop: { type: String, required: true },
    },
    brand: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    category: { type: String, required: true },
    typeSize: { type: String, enum: ["string", "number", "not"], default: "not" },
    detail: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
    },
    manufacturer: { type: String, required: true },
    preserves: [{ type: String, required: true }],
    notes: [{ type: String, required: true }],
    tags: [{ type: String, required: true }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
