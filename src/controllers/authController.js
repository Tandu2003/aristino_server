const bcrypt = require("../config/bcrypt");
const jwt = require("../config/jwt");

const account = require("../models/account");

class AuthController {
  async check(req, res) {
    const token = req.cookies.token;
    const cookieUser = req.cookies.user;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Chưa đăng nhập",
      });
    }

    const user = jwt.verifyToken(token);

    const checkUser = await account.findOne({ email: user.email });

    console.log(checkUser);

    if (!checkUser) {
      res.clearCookie("token");
      res.clearCookie("user");
      return res.status(401).json({
        success: false,
        loggedIn: false,
        message: "Tài khoản đã bị xóa",
      });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        loggedIn: false,
        message: "Token không hợp lệ",
      });
    }

    res.status(200).json({
      success: true,
      loggedIn: true,
      message: "Đã đăng nhập",
      user: JSON.parse(cookieUser),
    });
  }

  async login(req, res) {
    const { email, password } = req.body;

    try {
      const user = await account.findOne({ email });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Email không tồn tại",
        });
      }

      const isMatch = await bcrypt.comparePassword(password, user.password);

      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Mật khẩu không chính xác",
        });
      }

      const token = jwt.generateToken(user);  
      res.cookie("token", token, {
        httpOnly: true,
        // secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000 * 7, // 7 days
      });
      res.cookie("user", JSON.stringify(user), {
        httpOnly: true,
        secure: false,
      });

      res.status(200).json({
        success: true,
        loggedIn: true,
        message: "Đăng nhập thành công",
        user,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async register(req, res) {
    const { email, password, lastName, firstName } = req.body;

    console.log(req.body);

    try {
      const isExist = await account.findOne({ email });

      if (isExist) {
        return res.status(400).json({
          success: false,
          message: "Email đã tồn tại",
        });
      }

      const user = new account({
        email,
        password,
        profile: {
          lastName,
          firstName,
        },
      });

      const hashedPassword = await bcrypt.hashPassword(password);
      user.password = hashedPassword;

      await user.save();

      res.status(201).json({
        success: true,
        message: "Đăng ký thành công",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async logout(req, res) {
    res.clearCookie("token");
    res.clearCookie("user");
    res.status(200).json({
      success: true,
      loggedIn: false,
      message: "Đăng xuất thành công",
    });
  }
}

module.exports = new AuthController();
