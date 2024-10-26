// utils/sendEmail.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_PORT == 465, // true untuk port 465, false untuk 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendEmail = async (to, subject, text, html) => {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to,
    subject,
    text, // Teks alternatif
    html, // Konten HTML email
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email terkirim ke ${to}`);
  } catch (error) {
    console.error("Error mengirim email:", error);
  }
};

module.exports = sendEmail;
