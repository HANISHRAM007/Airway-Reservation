import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "../api/axios";

const GMAIL_REGEX = /^[A-Z0-9._%+-]+@gmail\.com$/i;

function normalizeEmail(value) {
  return value.trim().toLowerCase();
}

function Login() {
  const location = useLocation();
  const navigate = useNavigate();

  const [otpStep, setOtpStep] = useState("request");
  const [registerEmail, setRegisterEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [otpMessage, setOtpMessage] = useState("");
  const [otpError, setOtpError] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loadingOtp, setLoadingOtp] = useState(false);
  const [loadingLogin, setLoadingLogin] = useState(false);

  const fromRoute = location.state?.from || "/splash";

  const handleSendOtp = async (event) => {
    event.preventDefault();
    setOtpError("");
    setOtpMessage("");

    const email = normalizeEmail(registerEmail);
    if (!GMAIL_REGEX.test(email)) {
      setOtpError("Enter a valid Gmail address (example@gmail.com).");
      return;
    }

    setLoadingOtp(true);
    try {
      const response = await axios.post("/auth/send-otp", { email });
      setOtpMessage(response.data?.message || "OTP sent.");
      setOtpStep("verify");
      setRegisterEmail(email);
    } catch (error) {
      setOtpError(
        error.response?.data?.message || "Unable to send OTP right now."
      );
    } finally {
      setLoadingOtp(false);
    }
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    setOtpError("");
    setOtpMessage("");

    const email = normalizeEmail(registerEmail);
    if (!GMAIL_REGEX.test(email)) {
      setOtpError("Enter a valid Gmail address.");
      return;
    }

    if (!/^\d{6}$/.test(otp.trim())) {
      setOtpError("OTP must be a 6-digit code.");
      return;
    }

    if (newPassword.length < 8) {
      setOtpError("Password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setOtpError("Password and confirm password do not match.");
      return;
    }

    setLoadingOtp(true);
    try {
      const response = await axios.post("/auth/verify-otp", {
        email,
        otp: otp.trim(),
        password: newPassword,
      });
      setOtpMessage(response.data?.message || "Account verified.");
      setLoginEmail(email);
      setLoginPassword("");
      setOtpStep("request");
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setOtpError(
        error.response?.data?.message || "OTP verification failed."
      );
    } finally {
      setLoadingOtp(false);
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoginError("");
    const email = normalizeEmail(loginEmail);

    if (!GMAIL_REGEX.test(email)) {
      setLoginError("Enter a valid Gmail address.");
      return;
    }

    if (!loginPassword) {
      setLoginError("Password is required.");
      return;
    }

    setLoadingLogin(true);
    try {
      const response = await axios.post("/auth/login", {
        email,
        password: loginPassword,
      });

      const token = response.data?.token;
      const user = response.data?.user;
      if (!token) {
        throw new Error("No token received");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user || { email }));
      navigate(fromRoute, { replace: true });
    } catch (error) {
      setLoginError(
        error.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setLoadingLogin(false);
    }
  };

  return (
    <section className="auth-layout">
      <div className="auth-grid">
        <aside className="auth-panel">
          <p className="eyebrow">Airway Reservation</p>
          <h1 className="title">Secure Flight Desk</h1>
          <p className="subtitle">
            Verify your Gmail with OTP, create password once, and continue with
            a validated login session.
          </p>
          <ul className="auth-points">
            <li>Email OTP verification with expiry</li>
            <li>Credential validation before session creation</li>
            <li>Post-login splash and guided booking funnel</li>
          </ul>
        </aside>

        <div className="auth-panel auth-panel--forms">
          <form className="form-card" onSubmit={handleLogin}>
            <h2 className="section-title">Login</h2>
            <p className="helper-text">For verified users</p>

            <div className="field">
              <label htmlFor="login-email">Gmail</label>
              <input
                id="login-email"
                type="email"
                placeholder="you@gmail.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                placeholder="Enter password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />
            </div>

            {loginError ? <p className="status-text status-text--error">{loginError}</p> : null}

            <button className="primary-btn" type="submit" disabled={loadingLogin}>
              {loadingLogin ? "Signing in..." : "Login"}
            </button>
          </form>

          <div className="auth-divider" />

          <form
            className="form-card form-card--soft"
            onSubmit={otpStep === "request" ? handleSendOtp : handleVerifyOtp}
          >
            <h2 className="section-title">New User Verification</h2>
            <p className="helper-text">
              Step 1: send OTP. Step 2: verify OTP and set password.
            </p>

            <div className="field">
              <label htmlFor="register-email">Gmail</label>
              <input
                id="register-email"
                type="email"
                placeholder="newuser@gmail.com"
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
                disabled={otpStep === "verify"}
              />
            </div>

            {otpStep === "verify" ? (
              <>
                <div className="field">
                  <label htmlFor="otp-code">OTP</label>
                  <input
                    id="otp-code"
                    type="text"
                    placeholder="6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                  />
                </div>
                <div className="field">
                  <label htmlFor="new-password">Set password</label>
                  <input
                    id="new-password"
                    type="password"
                    placeholder="Minimum 8 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="confirm-password">Confirm password</label>
                  <input
                    id="confirm-password"
                    type="password"
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </>
            ) : null}

            {otpMessage ? (
              <p className="status-text status-text--success">{otpMessage}</p>
            ) : null}
            {otpError ? <p className="status-text status-text--error">{otpError}</p> : null}

            <div className="inline-form-actions">
              <button className="primary-btn" type="submit" disabled={loadingOtp}>
                {loadingOtp
                  ? "Please wait..."
                  : otpStep === "request"
                  ? "Send OTP"
                  : "Verify OTP"}
              </button>
              {otpStep === "verify" ? (
                <button
                  type="button"
                  className="subtle-btn"
                  onClick={() => {
                    setOtpStep("request");
                    setOtp("");
                    setNewPassword("");
                    setConfirmPassword("");
                    setOtpError("");
                    setOtpMessage("");
                  }}
                >
                  Change Email
                </button>
              ) : null}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

export default Login;
