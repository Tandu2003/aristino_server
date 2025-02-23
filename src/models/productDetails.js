const mongoose = require("mongoose");

const productDetailSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    variants: [
      {
        color: { type: String, required: true },
        images: [{ type: String, required: true }],
        sizes: [
          {
            size: { type: String, required: true },
            quantity: { type: Number, required: true, default: 0 },
          },
        ],
      },
    ],
    comments: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
        content: { type: String, required: true },
        rating: { type: Number, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("ProductDetail", productDetailSchema);
