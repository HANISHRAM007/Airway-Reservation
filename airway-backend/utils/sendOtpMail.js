const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "airwaytest007@gmail.com",
    pass: "imyd booq xenb hcnn"
  }
});

const sendOtpMail = async (email, otp) => {
  await transporter.sendMail({
    from: "Airway Reservation <airwaytest007@gmail.com>",
    to: email,
    subject: "Your OTP for Airway Reservation",
    text: `Your OTP is ${otp}. It is valid for 5 minutes.`
  });
};

module.exports = sendOtpMail;
