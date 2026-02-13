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
  availableSeats: Number
});

module.exports = mongoose.model("Flight", flightSchema);
