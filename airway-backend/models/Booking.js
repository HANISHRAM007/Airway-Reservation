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
      gender: String,
      seatNumber: String
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

  cancellationStatus: {
  type: String,
  enum: ["NONE", "CANCELLED"],
  default: "NONE"
},

refundStatus: {
  type: String,
  enum: ["NOT_APPLICABLE", "INITIATED", "REFUNDED"],
  default: "NOT_APPLICABLE"
},

cancelledAt: Date,


  bookingDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Booking", bookingSchema);
