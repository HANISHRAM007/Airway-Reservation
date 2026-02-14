const DEFAULT_TOTAL_SEATS = 40;
const FOUR_SEAT_COLUMNS = ["A", "B", "C", "D"];
const SIX_SEAT_COLUMNS = ["A", "B", "C", "D", "E", "F"];

const normalizeSeatCount = (value) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_TOTAL_SEATS;
};

const getSeatColumns = (totalSeats) => {
  // Narrow body defaults to 4 seats/row, larger inventory uses 6.
  if (totalSeats >= 90 || totalSeats % 6 === 0) {
    return SIX_SEAT_COLUMNS;
  }
  return FOUR_SEAT_COLUMNS;
};

const buildSeatMap = (totalSeats) => {
  const count = normalizeSeatCount(totalSeats);
  const columns = getSeatColumns(count);
  const seats = [];
  let row = 1;

  while (seats.length < count) {
    for (const column of columns) {
      if (seats.length >= count) break;
      seats.push({
        seatNumber: `${row}${column}`,
        isBooked: false
      });
    }
    row += 1;
  }

  return seats;
};

const ensureFlightSeats = async (flight) => {
  if (Array.isArray(flight.seats) && flight.seats.length > 0) {
    return flight;
  }

  const seedCount = normalizeSeatCount(flight.totalSeats || flight.availableSeats);
  flight.seats = buildSeatMap(seedCount);
  flight.totalSeats = seedCount;

  if (typeof flight.availableSeats !== "number") {
    flight.availableSeats = seedCount;
  }

  await flight.save();
  return flight;
};

module.exports = {
  buildSeatMap,
  ensureFlightSeats
};
