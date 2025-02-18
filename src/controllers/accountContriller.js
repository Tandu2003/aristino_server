const account = require("../models/account");

class AccountController {
  async getAccounts(req, res) {
    try {
      const accounts = await account.find();
      res.status(200).json(accounts);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server error");
    }
  }
}

module.exports = new AccountController();
