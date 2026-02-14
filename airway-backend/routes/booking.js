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
    const { flightIds, flightId, passengers } = req.body;
    const normalizedFlightIds = Array.isArray(flightIds)
      ? flightIds.filter(Boolean)
      : flightId
        ? [flightId]
        : [];

    if (normalizedFlightIds.length === 0) {
      return res.status(400).json({ message: "At least one flight is required" });
    }

    if (!Array.isArray(passengers) || passengers.length === 0) {
      return res.status(400).json({ message: "At least one passenger is required" });
    }

    const flights = await Flight.find({ _id: { $in: normalizedFlightIds } });

    if (flights.length !== normalizedFlightIds.length) {
      return res.status(404).json({ message: "One or more flights not found" });
    }

    // Check seat availability for all flights
    for (let flight of flights) {
      if (flight.availableSeats < passengers.length) {
        return res.status(400).json({
          message: `Not enough seats in ${flight.airline}`
        });
      }
    }

    const bookingId = "AIR" + Date.now();

    let totalAmount = 0;
    flights.forEach(f => {
      totalAmount += f.price * passengers.length;
    });

    const booking = new Booking({
      bookingId,
      userId: req.user.id,
      flights: normalizedFlightIds,
      passengers,
      tripType: normalizedFlightIds.length > 1 ? "ROUND_TRIP" : "ONE_WAY",
      totalAmount
    });

    await booking.save();

    res.json({
      message: "Flight(s) booked successfully",
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
    if (!Array.isArray(booking.flights) || booking.flights.length === 0) {
      return res.status(400).json({ message: "No flights found for this booking" });
    }

    const flights = await Flight.find({ _id: { $in: booking.flights } });

    if (flights.length !== booking.flights.length) {
      return res.status(404).json({ message: "One or more flights not found" });
    }

    for (let flight of flights) {
  for (let passenger of passengers) {

    const seat = flight.seats.find(
      s => s.seatNumber === passenger.seatNumber
    );

    if (!seat) {
      return res.status(400).json({
        message: `Seat ${passenger.seatNumber} not found in ${flight.airline}`
      });
    }

    if (seat.isBooked) {
      return res.status(400).json({
        message: `Seat ${passenger.seatNumber} already booked`
      });
    }
  }
}


    for (const flight of flights) {
   for (let passenger of booking.passengers) {
      const seat = flight.seats.find(
        s => s.seatNumber === passenger.seatNumber
      );

      if (seat) {
        seat.isBooked = true;
      }
    }
    await flight.save();

      await flight.save();
    }

    const fileName = await generateTicket(booking, flights[0]);

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
/**
 * CANCEL BOOKING
 */
router.post("/cancel/:bookingId", authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findOne({
      bookingId: req.params.bookingId,
      userId: req.user.id
    }).populate("flights");

    if (!booking)
      return res.status(404).json({ message: "Booking not found" });

    if (booking.cancellationStatus === "CANCELLED")
      return res.status(400).json({ message: "Already cancelled" });

    if (booking.paymentStatus !== "SUCCESS")
      return res.status(400).json({ message: "Payment not completed" });

    // Restore seats
    for (let flight of booking.flights) {
     for (let passenger of booking.passengers) {
  const seat = flight.seats.find(
    s => s.seatNumber === passenger.seatNumber
  );

  if (seat) {
    seat.isBooked = false;
  }
}
await flight.save();

      await flight.save();
    }

    booking.cancellationStatus = "CANCELLED";
    booking.refundStatus = "REFUNDED";
    booking.cancelledAt = new Date();

    await booking.save();

    res.json({
      message: "Booking cancelled successfully",
      refundStatus: booking.refundStatus
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Cancellation failed" });
  }
});


module.exports = router;
