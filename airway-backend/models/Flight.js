const mongoose = require("mongoose");

const flightSchema = new mongoose.Schema({
  flightNumber: String,
  airline: String,
  from: String,
  to: String,
  departureTime: Date,
  arrivalTime: Date,
  price: Number,
  totalSeats: { type: Number, default: 40 },
  availableSeats: { type: Number, default: 40 },
  seats: {
    type: [
      {
        seatNumber: String,
        isBooked: { type: Boolean, default: false }
      }
    ],
    default: []
  }

});

module.exports = mongoose.model("Flight", flightSchema);
