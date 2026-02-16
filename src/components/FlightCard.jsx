function formatTime(value) {
  if (!value) return "--:--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--:--";

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function FlightCard({
  flightNo,
  from,
  to,
  flightName,
  price,
  departureTime,
  arrivalTime,
  availableSeats,
  selected = false,
  buttonLabel = "Book Now",
  onSelect,
}) {
  const displayPrice =
    typeof price === "number"
      ? `INR ${price.toLocaleString("en-IN")}`
      : price
      ? `INR ${price}`
      : "";

  return (
    <button
      type="button"
      className={`flight-card ${selected ? "flight-card--selected" : ""}`}
      onClick={onSelect}
    >
      <div className="flight-card__top">
        <div>
          <h3 className="flight-card__title">{flightName}</h3>
          <p className="flight-card__meta">Flight No: {flightNo || "NA"}</p>
        </div>
        {displayPrice ? (
          <div className="flight-card__price">{displayPrice}</div>
        ) : null}
      </div>

      <div className="flight-card__route">
        <span>{from || "--"}</span>
        <span className="route-arrow">-&gt;</span>
        <span>{to || "--"}</span>
      </div>

      <div className="flight-card__meta-grid">
        <p>
          <span className="summary-label">Departure</span>
          <span className="summary-value">{formatTime(departureTime)}</span>
        </p>
        <p>
          <span className="summary-label">Arrival</span>
          <span className="summary-value">{formatTime(arrivalTime)}</span>
        </p>
        <p>
          <span className="summary-label">Seats Left</span>
          <span className="summary-value">{availableSeats ?? "NA"}</span>
        </p>
      </div>

      <span className="flight-card__cta">
        {selected ? "Selected" : buttonLabel}
      </span>
    </button>
  );
}

export default FlightCard;
