import { useState } from "react";
import { useNavigate } from "react-router-dom";

function SearchFlights() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSearch = (event) => {
    if (event) event.preventDefault();
    const fromValue = from.trim();
    const toValue = to.trim();

    if (!fromValue || !toValue) {
      setError("Please enter both From and To.");
      return;
    }

    setError("");
    navigate(
      `/flights?from=${encodeURIComponent(fromValue)}&to=${encodeURIComponent(
        toValue
      )}`
    );
  };

  return (
    <section className="page">
      <div className="panel">
        <header className="page-header">
          <p className="eyebrow">Avent Travel</p>
          <h2 className="title">Search Flights</h2>
          <p className="subtitle">
            Find premium routes with realtime availability and AI assisted
            planning.
          </p>
        </header>

        <form className="search-form" onSubmit={handleSearch}>
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
          </div>

          <button className="primary-btn" type="submit">
            Search Flights
          </button>
        </form>

        {error ? <p className="error">{error}</p> : null}
      </div>
    </section>
  );
}

export default SearchFlights;
