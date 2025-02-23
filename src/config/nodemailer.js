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
    from: `"ARISTINO" <${process.env.EMAIL_USER}>`,
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

module.exports = sendEmail;
