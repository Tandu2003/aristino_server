const slider = require("../models/slider");

class SliderController {
  async getSliders(req, res) {
    try {
      const sliders = await slider.find().sort({ createdAt: -1 });
      res.json(sliders);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
}

module.exports = new SliderController();
