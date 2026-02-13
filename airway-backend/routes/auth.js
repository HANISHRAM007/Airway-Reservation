const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const sendOtpMail = require("../utils/sendOtpMail");

const router = express.Router();

/**
 * STEP 1: Send OTP
 */
router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email)
      return res.status(400).json({ message: "Email is required" });

    const existingUser = await User.findOne({ email });

    // If already verified → block resend
    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({
        message: "Account already exists. Please login."
      });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    let user = existingUser || new User({ email });

    user.otp = otp;
    user.otpExpiry = otpExpiry;

    await user.save();

    await sendOtpMail(email, otp);

    return res.json({ message: "OTP sent successfully" });

  } catch (error) {
    console.error("SEND OTP ERROR:", error);
    return res.status(500).json({ message: "Failed to send OTP" });
  }
});

/**
 * STEP 2: Verify OTP & Set Password
 */
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password)
      return res.status(400).json({
        message: "Email, OTP and Password are required"
      });

    const user = await User.findOne({ email });

    if (!user)
      return res.status(400).json({ message: "User not found" });

    if (
      user.otp !== String(otp) ||
      !user.otpExpiry ||
      user.otpExpiry.getTime() < Date.now()
    ) {
      return res.status(400).json({
        message: "Invalid or expired OTP"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;

    await user.save();

    return res.json({
      message: "Account verified successfully"
    });

  } catch (err) {
    console.error("VERIFY ERROR:", err);
    return res.status(500).json({ message: "Verification failed" });
  }
});

/**
 * STEP 3: Login API (Email + Password + JWT)
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({
        message: "Email and Password required"
      });

    const user = await User.findOne({ email });

    if (!user || !user.isVerified)
      return res.status(400).json({
        message: "Account not verified"
      });

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return res.status(400).json({
        message: "Invalid credentials"
      });

    // 🔐 Generate JWT
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email
      }
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ message: "Login failed" });
  }
});

module.exports = router;
