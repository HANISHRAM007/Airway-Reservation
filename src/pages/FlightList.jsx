import { useNavigate, useSearchParams } from "react-router-dom";
import FlightCard from "../components/FlightCard";

function FlightList() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const flights = [
    { flightNo: "AI-101", from: "DEL", to: "MAA", flightName: "Air India", price: 4500 },
    { flightNo: "IN-202", from: "BLR", to: "BOM", flightName: "IndiGo", price: 3800 },
    { flightNo: "6E-303", from: "HYD", to: "CCU", flightName: "SpiceJet", price: 2900 },
    { flightNo: "IN-301", from: "MDU", to: "GOA", flightName: "IndiGo", price: 2900 },
    { flightNo: "VA-301", from: "MDU", to: "CHA", flightName: "VISTARA", price: 2900 },
    { flightNo: "VA-302", from: "MDU", to: "KOL", flightName: "VISTARA", price: 3200 },
    { flightNo: "IN-301", from: "MDU", to: "CHA", flightName: "IndiGo", price: 2900 },
  ];

  const fromQuery = (searchParams.get("from") || "").trim().toUpperCase();
  const toQuery = (searchParams.get("to") || "").trim().toUpperCase();
  const hasFilters = fromQuery || toQuery;

  const filteredFlights = flights.filter((flight) => {
    if (fromQuery && flight.from.toUpperCase() !== fromQuery) return false;
    if (toQuery && flight.to.toUpperCase() !== toQuery) return false;
    return true;
  });

  const handleSelect = (flight) => {
    const params = new URLSearchParams();
    params.set("flightNo", flight.flightNo);
    params.set("from", flight.from);
    params.set("to", flight.to);
    params.set("flightName", flight.flightName);
    if (flight.price !== undefined && flight.price !== null) {
      params.set("price", String(flight.price));
    }

    navigate(`/traveler-info?${params.toString()}`);
  };

  return (
    <section className="page">
      <div className="panel">
        <header className="page-header">
          <p className="eyebrow">Avent Travel</p>
          <h2 className="title">Available Flights</h2>
          <p className="subtitle">
            Curated routes matched to your search with premium cabin options.
            Select a flight to continue.
          </p>
        </header>

        {hasFilters ? (
          <div className="chip-row">
            <span className="chip">From: {fromQuery || "Any"}</span>
            <span className="chip">To: {toQuery || "Any"}</span>
          </div>
        ) : null}

        {filteredFlights.length === 0 ? (
          <div className="empty-state">
            <h3>No flights found</h3>
            <p>Try adjusting your From and To locations.</p>
          </div>
        ) : (
          <div className="flight-grid">
            {filteredFlights.map((f, i) => (
              <FlightCard key={i} {...f} onSelect={() => handleSelect(f)} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default FlightList;
