const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const sendOtpMail = require("../utils/sendOtpMail");

const router = express.Router();

/**
 * STEP 1: Send OTP
 */
router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;

    const otp = Math.floor(100000 + Math.random() * 900000);

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Airway App OTP Verification",
      text: `Your OTP is ${otp}`
    });

    res.json({ message: "OTP sent successfully" });

  } catch (error) {
    console.error("EMAIL ERROR 👉", error); // 👈 ADD THIS
    res.status(500).json({ message: "Failed to send OTP" });
  }
});


/**
 * STEP 2: Verify OTP & Set Password
 */
router.post("/verify-otp", async (req, res) => {
  const { email, otp, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user)
      return res.status(400).json({ message: "User not found" });

    if (user.otp !== otp || user.otpExpiry < Date.now())
      return res.status(400).json({ message: "Invalid or expired OTP" });

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;

    await user.save();

    res.json({ message: "Account verified successfully" });
  } catch (err) {
    res.status(500).json({ message: "Verification failed" });
  }
});

module.exports = router;

// Login API (Email + Password)

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user || !user.isVerified)
    return res.status(400).json({ message: "Account not verified" });

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch)
    return res.status(400).json({ message: "Invalid credentials" });

  res.json({ message: "Login successful" });
});
