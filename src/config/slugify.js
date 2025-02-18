const slugify = require("slugify");

module.exports = (text) => {
  return slugify(text, {
    replacement: "-",
    remove: /[*+~.()'"!:@]/g,
    lower: true,
  });
};
