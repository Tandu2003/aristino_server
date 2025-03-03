const express = require("express");

const account = require("../controllers/accountController");
const product = require("../controllers/productController");
const wishlist = require("../controllers/wishlistController");

const router = express.Router();

// router account
router.get("/accounts", account.getAccounts);

// router product
router.get("/products", product.getProducts);

// router wishlist
router.get("/wishlists/:userId", wishlist.getWishlists);
router.patch("/wishlists/:userId/:productId", wishlist.toggleWishlist);

module.exports = router;
