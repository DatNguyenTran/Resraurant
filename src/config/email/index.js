require("dotenv").config();
const nodemailer = require("nodemailer");

const host = process.env.HOST;
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

exports.sendMail = async (to, resetToken, isRegister) => {
  try {
    const emailType = isRegister
      ? "Verify your account"
      : "Reset your account password";
    const actionText = isRegister ? "Verify Account" : "Reset Password";
    const actionUrl = `${host}/auth/${
      isRegister ? "verify" : "new-password"
    }/${resetToken}`;
    const uniqueCode = Math.floor(Math.random() * 100000);

    const emailHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            background-color: #f4f4f4;
            padding: 20px;
            text-align: center;
          }
          .container {
            max-width: 500px;
            margin: auto;
            padding: 20px;
            background: #ffffff;
            border-radius: 10px;
            box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
            text-align: center;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #007bff;
            margin-bottom: 20px;
          }
          h2 {
            color: #333;
          }
          p {
            font-size: 16px;
            color: #555;
            line-height: 1.5;
          }
          .button {
            display: inline-block;
            padding: 12px 20px;
            font-size: 18px;
            color: #ffffff;
            background: #007bff;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            margin: 20px 0;
            transition: 0.3s;
          }
          .button:hover {
            background: #0056b3;
          }
          .footer {
            font-size: 13px;
            color: #777;
            margin-top: 20px;
            border-top: 1px solid #ddd;
            padding-top: 10px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">🌍 My Service</div>
          <h2>Security Alert</h2>
          <p>Xin chào,</p>
          <p>Bạn vừa yêu cầu ${
            isRegister ? "xác minh tài khoản" : "đặt lại mật khẩu"
          }. Nhấp vào nút bên dưới để tiếp tục:</p>
          <a href="${actionUrl}" class="button">${actionText}</a>
          <p>Nếu bạn không thực hiện yêu cầu này, hãy bỏ qua email này.</p>
          <p class="footer">Mã tham chiếu: <strong>${uniqueCode}</strong></p>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: to,
      subject: emailType,
      html: emailHTML,
    });
  } catch (err) {
    console.error(`Lỗi khi gởi email ${to}:`, err.message);
  }
};
