import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

function formatToday() {
  return new Date().toISOString().split("T")[0];
}

function SearchFlights() {
  const minDate = formatToday();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [tripType, setTripType] = useState("ONE_WAY");
  const [departureDate, setDepartureDate] = useState(minDate);
  const [returnDate, setReturnDate] = useState("");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const saved = sessionStorage.getItem("tripSearch");
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);
      setFrom(parsed.from || "");
      setTo(parsed.to || "");
      setTripType(parsed.tripType || "ONE_WAY");
      setDepartureDate(parsed.departureDate || minDate);
      setReturnDate(parsed.returnDate || "");
      setAdults(parsed.passengers?.adults ?? 1);
      setChildren(parsed.passengers?.children ?? 0);
      setInfants(parsed.passengers?.infants ?? 0);
    } catch (parseError) {
      console.error("Failed to parse previous trip search", parseError);
    }
  }, [minDate]);

  const totalPassengers = useMemo(
    () => Number(adults) + Number(children) + Number(infants),
    [adults, children, infants]
  );

  const handleSearch = (event) => {
    if (event) event.preventDefault();
    const fromValue = from.trim().toUpperCase();
    const toValue = to.trim().toUpperCase();

    if (!fromValue || !toValue) {
      setError("Please enter both From and To.");
      return;
    }

    if (fromValue === toValue) {
      setError("From and To cannot be the same.");
      return;
    }

    if (!departureDate) {
      setError("Please select departure date.");
      return;
    }

    if (tripType === "ROUND_TRIP") {
      if (!returnDate) {
        setError("Please select return date.");
        return;
      }

      if (returnDate <= departureDate) {
        setError("Return date must be after departure date.");
        return;
      }
    }

    if (totalPassengers <= 0) {
      setError("At least one passenger is required.");
      return;
    }

    if (totalPassengers > 9) {
      setError("Maximum 9 passengers are allowed in one booking.");
      return;
    }

    setError("");

    const searchPayload = {
      from: fromValue,
      to: toValue,
      tripType,
      departureDate,
      returnDate: tripType === "ROUND_TRIP" ? returnDate : "",
      passengers: {
        adults: Number(adults),
        children: Number(children),
        infants: Number(infants),
        total: totalPassengers,
      },
    };

    sessionStorage.setItem("tripSearch", JSON.stringify(searchPayload));

    const params = new URLSearchParams({
      from: fromValue,
      to: toValue,
      departureDate,
      tripType,
      passengers: String(totalPassengers),
    });

    if (tripType === "ROUND_TRIP" && returnDate) {
      params.set("returnDate", returnDate);
    }

    navigate(`/flights?${params.toString()}`);
  };

  const handleTripTypeChange = (value) => {
    setTripType(value);
    if (value === "ONE_WAY") {
      setReturnDate("");
    }
  };

  const increment = (setter, current) => {
    setter(Math.min(9, Number(current) + 1));
  };

  const decrement = (setter, current, floor = 0) => {
    setter(Math.max(floor, Number(current) - 1));
  };

  const passengerSummary = `${adults} Adult${adults > 1 ? "s" : ""}, ${children} Child${
    children > 1 ? "ren" : ""
  }, ${infants} Infant${infants > 1 ? "s" : ""}`;

  return (
    <section className="page">
      <Header
        title="Trip Planner"
        subtitle="Select route, travel dates, journey type, and passenger count."
      />
      <div className="panel">
        <header className="page-header">
          <p className="eyebrow">Step 1</p>
          <h2 className="title">Search Flights</h2>
          <p className="subtitle">
            Build a one-way or round-trip plan with travel dates and passenger
            details.
          </p>
        </header>

        <form className="search-form" onSubmit={handleSearch}>
          <div className="trip-type-group">
            <button
              type="button"
              className={`trip-type-btn ${
                tripType === "ONE_WAY" ? "trip-type-btn--active" : ""
              }`}
              onClick={() => handleTripTypeChange("ONE_WAY")}
            >
              One-way
            </button>
            <button
              type="button"
              className={`trip-type-btn ${
                tripType === "ROUND_TRIP" ? "trip-type-btn--active" : ""
              }`}
              onClick={() => handleTripTypeChange("ROUND_TRIP")}
            >
              Round-trip
            </button>
          </div>

          <div className="form-grid">
            <div className="field">
              <label htmlFor="from">From</label>
              <input
                id="from"
                placeholder="DEL"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="to">To</label>
              <input
                id="to"
                placeholder="MAA"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="departureDate">Departure Date</label>
              <input
                id="departureDate"
                type="date"
                min={minDate}
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="returnDate">Return Date</label>
              <input
                id="returnDate"
                type="date"
                min={departureDate || minDate}
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                disabled={tripType !== "ROUND_TRIP"}
              />
            </div>
          </div>

          <div className="counter-grid">
            <div className="counter-field">
              <p className="summary-label">Adults</p>
              <div className="counter-controls">
                <button
                  type="button"
                  className="subtle-btn"
                  onClick={() => decrement(setAdults, adults, 1)}
                >
                  -
                </button>
                <span>{adults}</span>
                <button
                  type="button"
                  className="subtle-btn"
                  onClick={() => increment(setAdults, adults)}
                >
                  +
                </button>
              </div>
            </div>

            <div className="counter-field">
              <p className="summary-label">Children</p>
              <div className="counter-controls">
                <button
                  type="button"
                  className="subtle-btn"
                  onClick={() => decrement(setChildren, children)}
                >
                  -
                </button>
                <span>{children}</span>
                <button
                  type="button"
                  className="subtle-btn"
                  onClick={() => increment(setChildren, children)}
                >
                  +
                </button>
              </div>
            </div>

            <div className="counter-field">
              <p className="summary-label">Infants</p>
              <div className="counter-controls">
                <button
                  type="button"
                  className="subtle-btn"
                  onClick={() => decrement(setInfants, infants)}
                >
                  -
                </button>
                <span>{infants}</span>
                <button
                  type="button"
                  className="subtle-btn"
                  onClick={() => increment(setInfants, infants)}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="flight-summary">
            <div>
              <p className="summary-label">Trip Type</p>
              <p className="summary-value">
                {tripType === "ROUND_TRIP" ? "Round-trip" : "One-way"}
              </p>
            </div>
            <div>
              <p className="summary-label">Passengers</p>
              <p className="summary-value">
                {totalPassengers} Total ({passengerSummary})
              </p>
            </div>
          </div>

          <button className="primary-btn" type="submit">
            Continue to Available Flights
          </button>
        </form>

        {error ? <p className="error">{error}</p> : null}
      </div>
    </section>
  );
}

export default SearchFlights;
