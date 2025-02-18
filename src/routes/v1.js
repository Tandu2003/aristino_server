const express = require("express");

const account = require("../controllers/accountContriller");
const product = require("../controllers/productController");

const router = express.Router();

// router account
router.get("/accounts", account.getAccounts);

// router product
router.get("/products", product.getProducts);

module.exports = router;
