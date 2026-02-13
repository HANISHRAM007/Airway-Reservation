const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendOtpMail = async (email, otp) => {
  await transporter.sendMail({
    from: `Airway Reservation <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your OTP for Airway Reservation",
    text: `Your OTP is ${otp}. It is valid for 5 minutes.`
  });
};

module.exports = sendOtpMail;
