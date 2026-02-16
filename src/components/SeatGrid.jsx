function SeatGrid({ seats, selectedSeats, setSelectedSeats }) {

  const toggleSeat = (seat) => {
    if (seat.isBooked) return;

    if (selectedSeats.includes(seat.seatNumber)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seat.seatNumber));
    } else {
      setSelectedSeats([...selectedSeats, seat.seatNumber]);
    }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 60px)", gap: "10px" }}>
      {seats.map((seat) => (
        <button
          key={seat.seatNumber}
          onClick={() => toggleSeat(seat)}
          style={{
            padding: "10px",
            backgroundColor: seat.isBooked
              ? "red"
              : selectedSeats.includes(seat.seatNumber)
              ? "green"
              : "lightgray"
          }}
        >
          {seat.seatNumber}
        </button>
      ))}
    </div>
  );
}

export default SeatGrid;
