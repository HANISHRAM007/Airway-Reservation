import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "../api/axios";

function Passengers() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const { flightId, selectedSeats } = state || {};

  const [passengers, setPassengers] = useState(
    selectedSeats.map(seat => ({
      name: "",
      age: "",
      gender: "",
      seatNumber: seat
    }))
  );

  const handleChange = (index, field, value) => {
    const updated = [...passengers];
    updated[index][field] = value;
    setPassengers(updated);
  };

  const createBooking = async () => {
    const res = await axios.post("/booking/create", {
      flightId,
      passengers
    });

    navigate(`/payment/${res.data.bookingId}`);
  };

  return (
    <div>
      <h2>Passenger Details</h2>

      {passengers.map((p, index) => (
        <div key={index}>
          <h4>Seat: {p.seatNumber}</h4>

          <input
            placeholder="Name"
            onChange={(e) => handleChange(index, "name", e.target.value)}
          />

          <input
            placeholder="Age"
            onChange={(e) => handleChange(index, "age", e.target.value)}
          />

          <select
            onChange={(e) => handleChange(index, "gender", e.target.value)}
          >
            <option>Gender</option>
            <option>Male</option>
            <option>Female</option>
          </select>
        </div>
      ))}

      <button onClick={createBooking}>Proceed to Payment</button>
    </div>
  );
}

export default Passengers;
