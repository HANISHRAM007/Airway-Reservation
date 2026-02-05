function FlightCard({ flightNo, from, to, flightName, price, onSelect }) {
  const displayPrice =
    typeof price === "number"
      ? `INR ${price.toLocaleString("en-IN")}`
      : price
      ? `INR ${price}`
      : "";

  return (
    <button type="button" className="flight-card" onClick={onSelect}>
      <div className="flight-card__top">
        <div>
          <h3 className="flight-card__title">{flightName}</h3>
          <p className="flight-card__meta">Flight No: {flightNo}</p>
        </div>
        {displayPrice ? (
          <div className="flight-card__price">{displayPrice}</div>
        ) : null}
      </div>
      <div className="flight-card__route">
        <span>{from}</span>
        <span className="route-arrow">-&gt;</span>
        <span>{to}</span>
      </div>
      <span className="flight-card__cta">Select flight</span>
    </button>
  );
}

export default FlightCard;
