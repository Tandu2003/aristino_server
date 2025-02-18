const product = require("../models/product");

const slugify = require("../config/slugify");

const getProducts = (product) => {
  return {
    ...product._doc,
    slug: slugify(product.name),
  };
};

class ProductController {
  async getProducts(req, res) {
    try {
      const products = await product.find();
      res.status(200).json(products.map(getProducts));
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new ProductController();
