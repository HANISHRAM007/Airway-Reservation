import { useState } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";

function Search() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [flights, setFlights] = useState([]);
  const navigate = useNavigate();

  const searchFlights = async () => {
    const params = {
      from: from.trim(),
      to: to.trim()
    };

    if (date) {
      params.date = date;
    }

    const res = await axios.get("/flight/search", { params });
    setFlights(res.data);
  };

  return (
    <div>
      <h2>Search Flights</h2>

      <input placeholder="From" onChange={(e) => setFrom(e.target.value)} />
      <input placeholder="To" onChange={(e) => setTo(e.target.value)} />
      <input type="date" onChange={(e) => setDate(e.target.value)} />

      <button onClick={searchFlights}>Search</button>

      {flights.map((flight) => (
        <div key={flight._id}>
          <p>{flight.airline} - ₹{flight.price}</p>
          <button onClick={() => navigate(`/seats/${flight._id}`)}>
            Select Seats
          </button>
        </div>
      ))}
    </div>
  );
}

export default Search;
