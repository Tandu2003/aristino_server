require("dotenv").config();
const bcrypt = require("../config/bcrypt");
const jwt = require("../config/jwt");
const account = require("../models/account");
const sendEmail = require("../config/nodemailer");

class AuthController {
  async check(req, res) {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Chưa đăng nhập",
      });
    }

    const user = jwt.verifyToken(token);

    const checkUser = await account.findOne({ email: user.email });

    if (!checkUser) {
      res.clearCookie("token");
      return res.status(401).json({
        success: false,
        loggedIn: false,
        message: "Tài khoản đã bị xóa",
      });
    }

    if (checkUser.password !== user.password) {
      res.clearCookie("token");
      return res.status(401).json({
        success: false,
        loggedIn: false,
        message: "Mật khẩu đã thay đổi",
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
      user: checkUser,
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

      const token = jwt.generateToken(user);

      const isMatch = await bcrypt.comparePassword(password, user.password);

      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Mật khẩu không chính xác",
        });
      }

      if (!user.verify) {
        sendEmail(
          user.email,
          "Thông báo xác thực tài khoản",
          `
          <div style="font-family: Arial, sans-serif; line-height: 1.5; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
              <h2 style="color: #007bff; text-align: center;">Xác thực tài khoản</h2>
              <p>Xin chào <strong>${
                user.profile.firstName + " " + user.profile.lastName || "bạn"
              }</strong>,</p>
              <p>Bạn đã đăng ký tài khoản trên hệ thống của chúng tôi. Vui lòng nhấn vào nút bên dưới để xác nhận tài khoản:</p>
              <div style="text-align: center; margin: 20px 0;">
                  <a href="http://localhost:5000/api/auth/verify-email/${token}" 
                    style="background-color: #007bff; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 5px; font-weight: bold;">
                    Xác nhận tài khoản
                  </a>
              </div>
              <p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.</p>
              <p><strong>Trân trọng,</strong></p>
              <p><strong>Admin</strong></p>
          </div>
          `
        );

        return res.status(401).json({
          success: false,
          message: "Tài khoản chưa được xác thực, vui lòng kiểm tra email",
        });
      }

      res.cookie("token", token, {
        httpOnly: true,
        // secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000 * 7, // 7 days
      });

      if (user.role !== "admin") {
        await sendEmail(
          user.email,
          "Thông báo đăng nhập",
          `
          <div style="font-family: Arial, sans-serif; line-height: 1.5; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
              <h2 style="color: #007bff;">Thông báo đăng nhập</h2>
              <p>Xin chào <strong>${
                user.profile.firstName + " " + user.profile.lastName || "người dùng"
              }</strong>,</p>
              <p>Chúng tôi phát hiện một lần đăng nhập vào tài khoản của bạn.</p>
              <p><sp>Thời gian: </span> ${new Date().toLocaleString()}</p>
              <p>Nếu bạn không phải là người thực hiện hãy đổi mật khẩu ngay lập tức.</p>
              <p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.</p>
              <p><strong>Trân trọng,</strong></p>
              <p><strong>Admin</strong></p>
          </div>
          `
        );
      }

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

      const token = jwt.generateToken(user);

      sendEmail(
        user.email,
        "Thông báo xác thực tài khoản",
        `
        <div style="font-family: Arial, sans-serif; line-height: 1.5; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
            <h2 style="color: #007bff; text-align: center;">Xác thực tài khoản</h2>
            <p>Xin chào <strong>${
              user.profile.firstName + " " + user.profile.lastName || "bạn"
            }</strong>,</p>
            <p>Bạn đã đăng ký tài khoản trên hệ thống của chúng tôi. Vui lòng nhấn vào nút bên dưới để xác nhận tài khoản:</p>
            <div style="text-align: center; margin: 20px 0;">
                <a href="http://localhost:5000/api/auth/verify-email/${token}" 
                  style="background-color: #007bff; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 5px; font-weight: bold;">
                  Xác nhận tài khoản
                </a>
            </div>
            <p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.</p>
            <p><strong>Trân trọng,</strong></p>
            <p><strong>Admin</strong></p>
        </div>
        `
      );

      res.status(201).json({
        success: true,
        message: "Đăng ký thành công, vui lòng kiểm tra email để xác thực tài khoản",
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
    res.status(200).json({
      success: true,
      loggedIn: false,
      message: "Đăng xuất thành công",
    });
  }

  async verifyEmail(req, res) {
    const token = req.params.token;
    const clientUrl = process.env.CLIENT_URL;

    try {
      const user = jwt.verifyToken(token);
      const checkUser = await account.findOne({ email: user.email });

      if (!checkUser) {
        return res.status(404).json({ success: false, message: "Tài khoản không tồn tại" });
      }

      if (checkUser.verify) {
        if (req.headers.accept.includes("text/html")) {
          return res.redirect(`${clientUrl}/account/login?verified=already`);
        }
        return res.status(400).json({ success: false, message: "Tài khoản đã được xác thực" });
      }

      checkUser.verify = true;
      await checkUser.save();

      await sendEmail(
        checkUser.email,
        "Xác thực tài khoản thành công",
        `
            <div style="font-family: Arial, sans-serif; line-height: 1.5; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                <h2 style="color: #007bff;">Xác thực tài khoản thành công</h2>
                <p>Xin chào <strong>${
                  checkUser.profile?.firstName + " " + checkUser.profile?.lastName || "người dùng"
                }</strong>,</p>
                <p>Tài khoản của bạn đã được xác thực thành công.</p>
                <p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.</p>
                <p><strong>Trân trọng,</strong></p>
                <p><strong>Admin</strong></p>
            </div>
            `
      );

      if (req.headers.accept.includes("text/html")) {
        return res.redirect(`${clientUrl}/account/login?verified=success`);
      }

      return res.status(200).json({ success: true, message: "Xác thực tài khoản thành công" });
    } catch (error) {
      if (req.headers.accept.includes("text/html")) {
        return res.redirect(`${clientUrl}/account/login?verified=failed`);
      }
      return res.status(500).json({ success: false, message: "Xác thực tài khoản thất bại" });
    }
  }

  async loginGoogle(req, res) {
    const { email, given_name, family_name, picture, email_verified, sub } = req.body;

    try {
      const user = await account.findOne({ email });

      if (!user) {
        const hashedPassword = await bcrypt.hashPassword(sub);

        const newUser = new account({
          email,
          password: hashedPassword,
          profile: {
            lastName: family_name,
            firstName: given_name,
            avatar: picture,
          },
          verify: email_verified,
        });

        await newUser.save();

        const token = jwt.generateToken(newUser);

        res.cookie("token", token, {
          httpOnly: true,
          // secure: process.env.NODE_ENV === "production",
          maxAge: 24 * 60 * 60 * 1000 * 7,
        });

        return res.status(200).json({
          success: true,
          loggedIn: true,
          message: "Đăng ký và đăng nhập thành công",
          user: newUser,
        });
      }

      const token = jwt.generateToken(user);

      res.cookie("token", token, {
        httpOnly: true,
        // secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000 * 7, // 7 days
      });

      if (user.role !== "admin") {
        await sendEmail(
          user.email,
          "Thông báo đăng nhập",
          `
          <div style="font-family: Arial, sans-serif; line-height: 1.5; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
              <h2 style="color: #007bff;">Thông báo đăng nhập</h2>
              <p>Xin chào <strong>${
                user.profile.firstName + " " + user.profile.lastName || "người dùng"
              }</strong>,</p>
              <p>Chúng tôi phát hiện một lần đăng nhập vào tài khoản của bạn.</p>
              <p><sp>Thời gian: </span> ${new Date().toLocaleString()}</p>
              <p>Nếu bạn không phải là người thực hiện hãy đổi mật khẩu ngay lập tức.</p>
              <p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.</p>
              <p><strong>Trân trọng,</strong></p>
              <p><strong>Admin</strong></p>
          </div>
          `
        );
      }

      res.status(200).json({
        success: true,
        loggedIn: true,
        message: "Đăng nhập thành công",
        user,
      });
    } catch (error) {}
  }

  async loginFacebook(req, res) {
    const { email, first_name, last_name, picture, id } = req.body;

    try {
      const user = await account.findOne({ email });

      if (!user) {
        const hashedPassword = await bcrypt.hashPassword(id);

        const newUser = new account({
          email,
          password: hashedPassword,
          profile: {
            lastName: last_name,
            firstName: first_name,
            avatar: picture.data.url,
          },
          verify: true,
        });

        await newUser.save();

        const token = jwt.generateToken(newUser);

        res.cookie("token", token, {
          httpOnly: true,
          // secure: process.env.NODE_ENV === "production",
          maxAge: 24 * 60 * 60 * 1000 * 7,
        });

        return res.status(200).json({
          success: true,
          loggedIn: true,
          message: "Đăng ký và đăng nhập thành công",
          user: newUser,
        });
      }

      const token = jwt.generateToken(user);

      res.cookie("token", token, {
        httpOnly: true,
        // secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000 * 7, // 7 days
      });

      if (user.role !== "admin") {
        await sendEmail(
          user.email,
          "Thông báo đăng nhập",
          `
          <div style="font-family: Arial, sans-serif; line-height: 1.5; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
              <h2 style="color: #007bff;">Thông báo đăng nhập</h2>
              <p>Xin chào <strong>${
                user.profile.firstName + " " + user.profile.lastName || "người dùng"
              }</strong>,</p>
              <p>Chúng tôi phát hiện một lần đăng nhập vào tài khoản của bạn.</p>
              <p><sp>Thời gian: </span> ${new Date().toLocaleString()}</p>
              <p>Nếu bạn không phải là người thực hiện hãy đổi mật khẩu ngay lập tức.</p>
              <p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.</p>
              <p><strong>Trân trọng,</strong></p>
              <p><strong>Admin</strong></p>
          </div>
          `
        );
      }

      res.status(200).json({
        success: true,
        loggedIn: true,
        message: "Đăng nhập thành công",
        user,
      });
    } catch (error) {}
  }
}

module.exports = new AuthController();
