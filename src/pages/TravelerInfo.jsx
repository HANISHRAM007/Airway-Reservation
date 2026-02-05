import { useState } from "react";
import { useSearchParams } from "react-router-dom";

function TravelerInfo() {
  const [searchParams] = useSearchParams();
  const [submitted, setSubmitted] = useState(false);

  const flightNo = searchParams.get("flightNo") || "";
  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";
  const flightName = searchParams.get("flightName") || "";
  const price = searchParams.get("price") || "";
  const priceNumber = Number(price);
  const displayPrice =
    price && Number.isFinite(priceNumber)
      ? priceNumber.toLocaleString("en-IN")
      : price;

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
  };

  const hasFlightSummary = flightNo || from || to || flightName || price;

  return (
    <section className="page">
      <div className="panel">
        <header className="page-header">
          <p className="eyebrow">Traveler Profile</p>
          <h2 className="title">Demography Details</h2>
          <p className="subtitle">
            Share passenger details to secure the booking and personalize the
            journey.
          </p>
        </header>

        {hasFlightSummary ? (
          <div className="flight-summary">
            <div>
              <p className="summary-label">Selected Flight</p>
              <p className="summary-value">
                {[flightName, flightNo].filter(Boolean).join(" · ")}
              </p>
            </div>
            <div>
              <p className="summary-label">Route</p>
              <p className="summary-value">
                {[from, to].filter(Boolean).join(" -> ")}
              </p>
            </div>
            {displayPrice ? (
              <div>
                <p className="summary-label">Fare</p>
                <p className="summary-value">INR {displayPrice}</p>
              </div>
            ) : null}
          </div>
        ) : null}

        <form className="search-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <h3 className="section-title">Primary Traveler</h3>
            <div className="form-grid">
              <div className="field">
                <label htmlFor="traveler-name">Full name</label>
                <input id="traveler-name" placeholder="Ananya Sharma" />
              </div>
              <div className="field">
                <label htmlFor="traveler-age">Age</label>
                <input id="traveler-age" type="number" placeholder="32" />
              </div>
              <div className="field">
                <label htmlFor="traveler-gender">Gender</label>
                <select id="traveler-gender" defaultValue="">
                  <option value="" disabled>
                    Select
                  </option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="non-binary">Non-binary</option>
                  <option value="prefer-not">Prefer not to say</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="traveler-nationality">Nationality</label>
                <input id="traveler-nationality" placeholder="Indian" />
              </div>
              <div className="field">
                <label htmlFor="traveler-email">Email</label>
                <input
                  id="traveler-email"
                  type="email"
                  placeholder="ananya@email.com"
                />
              </div>
              <div className="field">
                <label htmlFor="traveler-phone">Phone</label>
                <input id="traveler-phone" type="tel" placeholder="+91 98765 43210" />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Co-traveler</h3>
            <div className="form-grid">
              <div className="field">
                <label htmlFor="co-name">Full name</label>
                <input id="co-name" placeholder="Ravi Sharma" />
              </div>
              <div className="field">
                <label htmlFor="co-age">Age</label>
                <input id="co-age" type="number" placeholder="30" />
              </div>
              <div className="field">
                <label htmlFor="co-gender">Gender</label>
                <select id="co-gender" defaultValue="">
                  <option value="" disabled>
                    Select
                  </option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="non-binary">Non-binary</option>
                  <option value="prefer-not">Prefer not to say</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="co-relationship">Relationship</label>
                <input id="co-relationship" placeholder="Colleague" />
              </div>
            </div>
          </div>

          <button className="primary-btn" type="submit">
            Continue
          </button>
        </form>

        {submitted ? (
          <p className="success">Details captured. Continue to seat selection.</p>
        ) : null}
      </div>
    </section>
  );
}

export default TravelerInfo;
