const wishlist = require("../models/wishlist");
const ProductController = require("./productController");

class WishlistController {
  async getWishlists(req, res) {
    const { userId } = req.params;
    console.log(userId);

    try {
      const wishlists = await wishlist.find({ userId });

      console.log(wishlists[0]);
      

      res.status(200).json({ success: true, ...wishlists[0]._doc });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ message: "Server Error" });
    }
  }

  async toggleWishlist(req, res) {
    const { userId, productId } = req.params;

    try {
      const wishlists = await wishlist.find({ userId });

      if (wishlists.length === 0) {
        const newWishlist = new wishlist({
          userId,
          products: [productId],
        });

        await newWishlist.save();
        console.log("Đã tạo wishlist mới");
        return res.status(200).json(newWishlist);
      }

      const wishlistUser = wishlists[0];

      const index = wishlistUser.products.indexOf(productId);

      if (index === -1) {
        wishlistUser.products.push(productId);
        console.log("Đã thêm sản phẩm vào wishlist");
      } else {
        wishlistUser.products.splice(index, 1);
        console.log("Đã xóa sản phẩm khỏi wishlist");
      }

      await wishlistUser.save();

      res.status(200).json({ success: true, ...wishlistUser._doc });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new WishlistController();
