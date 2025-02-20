const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Email gửi đi
    pass: process.env.EMAIL_PASS, // Mật khẩu ứng dụng (App Password)
  },
});

/**
 * Gửi email
 * @param {string} to - Địa chỉ email người nhận
 * @param {string} subject - Tiêu đề email
 * @param {string} text - Nội dung email
 * @param {string} html - Nội dung email dạng HTML
 *
 * @returns {Promise<void>}
 */
const sendEmail = async (to, subject, html) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: to,
    subject: subject,
    html: html,
  };

  await transporter.sendMail(mailOptions, (error) => {
    if (error) {
      console.log("❌ Email không gửi được.");
    } else {
      console.log(`✅ Email đã gửi đến ${to}.`);
    }
  });
};

const sendVerificationEmail = async (user, token) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: "Xác nhận tài khoản của bạn",
    html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #007bff; text-align: center;">Xác nhận tài khoản</h2>
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
    `,
  };

  await transporter.sendMail(mailOptions, (error) => {
    if (error) {
      console.log("❌ Email xác thực không gửi được.");
    } else {
      console.log(`✅ Email xác thực đã gửi đến ${email}.`);
    }
  });
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
};
