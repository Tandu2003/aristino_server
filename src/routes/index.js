const v1 = require("./v1");
const auth = require("./auth");

module.exports = (app) => {
  app.use("/api/v1", v1);
  app.use("/api/auth", auth);
};
