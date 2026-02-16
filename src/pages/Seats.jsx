import { useEffect, useState } from "react";
import axios from "../api/axios";
import { useParams, useNavigate } from "react-router-dom";
import SeatGrid from "../components/SeatGrid";

function Seats() {
  const { flightId } = useParams();
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSeats = async () => {
      const res = await axios.get(`/flight/${flightId}/seats`);
      setSeats(res.data.seats);
    };

    fetchSeats();
  }, [flightId]);

  return (
    <div>
      <h2>Select Seats</h2>

      <SeatGrid
        seats={seats}
        selectedSeats={selectedSeats}
        setSelectedSeats={setSelectedSeats}
      />

      <button onClick={() => navigate("/passengers", {
        state: { flightId, selectedSeats }
      })}>
        Continue
      </button>
    </div>
  );
}

export default Seats;
