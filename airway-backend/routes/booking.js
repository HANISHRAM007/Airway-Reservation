const express = require("express");
const Booking = require("../models/Booking");
const Flight = require("../models/Flight");
const authMiddleware = require("../middleware/authMiddleware");
const generateTicket = require("../utils/generateTicket");
const User = require("../models/User");
const sendTicketMail = require("../utils/sendTicketMail");


const router = express.Router();

/**
 * BOOK FLIGHT (Protected)
 */
router.post("/create", authMiddleware, async (req, res) => {
  try {
    const { flightId, passengers } = req.body;

    const flight = await Flight.findById(flightId);

    if (!flight)
      return res.status(404).json({ message: "Flight not found" });

    if (flight.availableSeats < passengers.length)
      return res.status(400).json({ message: "Not enough seats available" });

    const bookingId = "AIR" + Date.now();
    const totalAmount = passengers.length * flight.price;

    const booking = new Booking({
      bookingId,
      userId: req.user.id,
      flightId,
      passengers,
      totalAmount,
      paymentStatus: "PENDING"
    });

    await booking.save();

    return res.json({
      message: "Booking created. Proceed to payment.",
      bookingId,
      totalAmount
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Booking failed" });
  }
});
router.post("/pay/:bookingId", authMiddleware, async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findOne({ bookingId });

    if (!booking)
      return res.status(404).json({ message: "Booking not found" });

    if (booking.paymentStatus === "SUCCESS")
      return res.json({ message: "Already paid" });

    // MOCK PAYMENT SUCCESS
    booking.paymentStatus = "SUCCESS";
    booking.paymentId = "PAY" + Date.now();

    await booking.save();

    // Reduce seats AFTER payment success
    const flight = await Flight.findById(booking.flightId);
    flight.availableSeats -= booking.passengers.length;
    await flight.save();

  const fileName = await generateTicket(booking, flight);

// Get user email
const user = await User.findById(booking.userId);

// Send ticket email
await sendTicketMail(user.email, booking.bookingId, fileName);


    return res.json({
      message: "Payment successful",
      ticketUrl: `http://localhost:5000/tickets/${fileName}`
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Payment failed" });
  }
});



module.exports = router;
