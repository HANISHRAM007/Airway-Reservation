import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "../api/axios";
import Header from "../components/Header";

function Payment() {
  const { bookingId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [paymentDraft, setPaymentDraft] = useState(null);
  const [paymentMode, setPaymentMode] = useState("UPI");
  const [upiId, setUpiId] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [bankName, setBankName] = useState("");

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [successInfo, setSuccessInfo] = useState(null);
  const [shareMessage, setShareMessage] = useState("");

  useEffect(() => {
    const stored = sessionStorage.getItem("paymentDraft");
    if (!stored && !location.state?.bookingId) {
      navigate("/trip", { replace: true });
      return;
    }

    if (!stored) {
      setPaymentDraft({
        bookingId: location.state?.bookingId,
        totalAmount: location.state?.totalAmount || 0,
        flights: [],
        search: null,
      });
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      setPaymentDraft(parsed);
    } catch (parseError) {
      console.error("Failed to parse payment draft", parseError);
      navigate("/trip", { replace: true });
    }
  }, [location.state, navigate]);

  const amount = useMemo(() => {
    const fromState = Number(location.state?.totalAmount || 0);
    const fromDraft = Number(paymentDraft?.totalAmount || 0);
    return fromState || fromDraft || 0;
  }, [location.state, paymentDraft]);

  const validatePaymentInput = () => {
    if (paymentMode === "UPI" && !/^\S+@\S+$/.test(upiId.trim())) {
      return "Enter a valid UPI ID.";
    }

    if (paymentMode === "CARD") {
      if (!cardName.trim()) return "Card holder name is required.";
      if (cardNumber.replace(/\s/g, "").length < 12) {
        return "Enter a valid card number.";
      }
      if (!/^\d{2}\/\d{2}$/.test(expiry)) {
        return "Expiry must be MM/YY.";
      }
      if (!/^\d{3,4}$/.test(cvv)) {
        return "Enter a valid CVV.";
      }
    }

    if (paymentMode === "NET_BANKING" && !bankName.trim()) {
      return "Select a bank for net banking.";
    }

    return "";
  };

  const makePayment = async (event) => {
    event.preventDefault();
    setError("");
    setShareMessage("");

    const validationError = validatePaymentInput();
    if (validationError) {
      setError(validationError);
      return;
    }

    setProcessing(true);
    try {
      const response = await axios.post(`/booking/pay/${bookingId}`, {
        paymentMode,
      });

      const ticketUrl = response.data?.ticketUrl || "";
      const payload = {
        message: response.data?.message || "Payment successful",
        ticketUrl,
      };

      setSuccessInfo(payload);

      if (paymentDraft) {
        const updatedDraft = {
          ...paymentDraft,
          ticketUrl,
          paymentMode,
        };
        sessionStorage.setItem("paymentDraft", JSON.stringify(updatedDraft));
      }
    } catch (apiError) {
      setError(
        apiError.response?.data?.message ||
          "Payment failed. Please retry with valid payment details."
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleShare = async () => {
    if (!successInfo?.ticketUrl) {
      setShareMessage("No ticket URL available yet.");
      return;
    }

    const sharePayload = {
      title: `Booking ${bookingId}`,
      text: `Your flight ticket is ready. Booking ID: ${bookingId}`,
      url: successInfo.ticketUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(sharePayload);
        setShareMessage("Ticket shared successfully.");
        return;
      }

      await navigator.clipboard.writeText(successInfo.ticketUrl);
      setShareMessage("Ticket link copied. Share it anywhere.");
    } catch (shareError) {
      setShareMessage("Unable to share automatically. Copy the link manually.");
      console.error(shareError);
    }
  };

  if (!paymentDraft && !location.state?.bookingId) return null;

  return (
    <section className="page">
      <Header
        title="Payment"
        subtitle="Step 4: complete payment and generate ticket PDF."
      />

      <div className="panel">
        <header className="page-header">
          <p className="eyebrow">Step 4</p>
          <h2 className="title">Payment Gateway</h2>
          <p className="subtitle">
            Booking ID is generated first. On successful payment, ticket PDF is
            generated and downloadable.
          </p>
        </header>

        <div className="flight-summary">
          <div>
            <p className="summary-label">Booking ID</p>
            <p className="summary-value">{bookingId}</p>
          </div>
          <div>
            <p className="summary-label">Amount</p>
            <p className="summary-value">INR {amount.toLocaleString("en-IN")}</p>
          </div>
          <div>
            <p className="summary-label">Status</p>
            <p className="summary-value">
              {successInfo ? "Payment Success" : "Awaiting Payment"}
            </p>
          </div>
        </div>

        {!successInfo ? (
          <form className="search-form" onSubmit={makePayment}>
            <div className="payment-methods">
              <button
                type="button"
                className={`method-btn ${paymentMode === "UPI" ? "method-btn--active" : ""}`}
                onClick={() => setPaymentMode("UPI")}
              >
                UPI
              </button>
              <button
                type="button"
                className={`method-btn ${paymentMode === "CARD" ? "method-btn--active" : ""}`}
                onClick={() => setPaymentMode("CARD")}
              >
                Card
              </button>
              <button
                type="button"
                className={`method-btn ${paymentMode === "NET_BANKING" ? "method-btn--active" : ""}`}
                onClick={() => setPaymentMode("NET_BANKING")}
              >
                Net Banking
              </button>
            </div>

            {paymentMode === "UPI" ? (
              <div className="field">
                <label htmlFor="upiId">UPI ID</label>
                <input
                  id="upiId"
                  placeholder="name@bank"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                />
              </div>
            ) : null}

            {paymentMode === "CARD" ? (
              <div className="form-grid">
                <div className="field">
                  <label htmlFor="cardName">Card Holder Name</label>
                  <input
                    id="cardName"
                    placeholder="As on card"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="cardNumber">Card Number</label>
                  <input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="expiry">Expiry (MM/YY)</label>
                  <input
                    id="expiry"
                    placeholder="08/29"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="cvv">CVV</label>
                  <input
                    id="cvv"
                    type="password"
                    placeholder="123"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                  />
                </div>
              </div>
            ) : null}

            {paymentMode === "NET_BANKING" ? (
              <div className="field">
                <label htmlFor="bankName">Bank Name</label>
                <select
                  id="bankName"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                >
                  <option value="">Select Bank</option>
                  <option value="HDFC">HDFC</option>
                  <option value="ICICI">ICICI</option>
                  <option value="SBI">SBI</option>
                  <option value="AXIS">Axis Bank</option>
                </select>
              </div>
            ) : null}

            {error ? <p className="error">{error}</p> : null}

            <div className="page-actions">
              <button
                type="button"
                className="subtle-btn"
                onClick={() => navigate("/traveler-info")}
              >
                Back
              </button>
              <button className="primary-btn" type="submit" disabled={processing}>
                {processing ? "Processing Payment..." : "Pay Now"}
              </button>
            </div>
          </form>
        ) : (
          <div className="success-panel">
            <h3>Payment Successful</h3>
            <p>{successInfo.message}</p>

            {successInfo.ticketUrl ? (
              <a
                className="primary-btn ticket-link"
                href={successInfo.ticketUrl}
                target="_blank"
                rel="noreferrer"
              >
                Download Ticket PDF
              </a>
            ) : null}

            <div className="page-actions">
              <button type="button" className="subtle-btn" onClick={handleShare}>
                Share Ticket
              </button>
              <button
                type="button"
                className="primary-btn"
                onClick={() => {
                  sessionStorage.removeItem("bookingDraft");
                  sessionStorage.removeItem("paymentDraft");
                  navigate("/trip", { replace: true });
                }}
              >
                Book Another Flight
              </button>
            </div>

            {shareMessage ? <p className="success">{shareMessage}</p> : null}
          </div>
        )}
      </div>
    </section>
  );
}

export default Payment;
