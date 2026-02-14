const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  bookingId: { type: String, unique: true },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  flights: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Flight"
    }
  ],

  passengers: [
    {
      name: String,
      age: Number,
      gender: String
    }
  ],

  tripType: {
    type: String,
    enum: ["ONE_WAY", "ROUND_TRIP"],
    default: "ONE_WAY"
  },

  totalAmount: Number,

  paymentStatus: {
    type: String,
    enum: ["PENDING", "SUCCESS", "FAILED"],
    default: "PENDING"
  },

  paymentId: String,

  bookingDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Booking", bookingSchema);
