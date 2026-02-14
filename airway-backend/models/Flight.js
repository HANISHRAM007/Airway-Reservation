const mongoose = require("mongoose");

const flightSchema = new mongoose.Schema({
  flightNumber: String,
  airline: String,
  from: String,
  to: String,
  departureTime: Date,
  arrivalTime: Date,
  price: Number,
  totalSeats: Number,
  seats: [
  {
    seatNumber: String,
    isBooked: { type: Boolean, default: false }
  }
]

});

module.exports = mongoose.model("Flight", flightSchema);
