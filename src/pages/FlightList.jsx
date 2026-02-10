import { useEffect, useState } from "react";
import FlightCard from "../components/FlightCard";

function FlightList() {
  const [flights, setFlights] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/flights")
      .then((res) => res.json())
      .then((data) => setFlights(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h2>Available Flights</h2>

      {flights.length === 0 && <p>No flights available</p>}

      {flights.map((f, i) => (
        <FlightCard key={i} {...f} />
      ))}
    </div>
  );
}

export default FlightList;
