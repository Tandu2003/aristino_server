const Product = require("../models/product");
const slugify = require("../config/slugify");

const getProducts = (product) => ({
  ...product,
  slug: slugify(product.name),
});

class ProductController {
  async getProducts(req, res) {
    try {
      const products = await Product.aggregate([
        {
          $lookup: {
            from: "productdetails",
            localField: "_id",
            foreignField: "productId",
            as: "details",
          },
        },
        { $set: { details: { $arrayElemAt: ["$details", 0] } } }, // Lấy object đầu tiên từ details[]
        { $replaceRoot: { newRoot: { $mergeObjects: ["$$ROOT", "$details"] } } }, // Gộp details vào object chính
        { $project: { details: 0 } }, // Xóa field `details` sau khi gộp
      ]).exec();

      res.status(200).json(products.map(getProducts));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getProductById(productId) {
    console.log(productId);

    try {
      const product = await Product.findById(productId).exec();

      return getProducts(product[0]);
    } catch (error) {
      console.error(error.message);
      return null;
    }
  }
}

module.exports = new ProductController();
