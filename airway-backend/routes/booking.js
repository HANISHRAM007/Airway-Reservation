const express = require("express");
const Booking = require("../models/Booking");
const Flight = require("../models/Flight");
const authMiddleware = require("../middleware/authMiddleware");
const generateTicket = require("../utils/generateTicket");
const User = require("../models/User");
const sendTicketMail = require("../utils/sendTicketMail");
const { ensureFlightSeats } = require("../utils/seatMap");


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
    for (const flight of flights) {
      await ensureFlightSeats(flight);

      const availableSeats = flight.seats.filter((seat) => !seat.isBooked).length;
      if (availableSeats < passengers.length) {
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

    // Reduce seats AFTER payment success
    if (!Array.isArray(booking.flights) || booking.flights.length === 0) {
      return res.status(400).json({ message: "No flights found for this booking" });
    }

    const flights = await Flight.find({ _id: { $in: booking.flights } });

    if (flights.length !== booking.flights.length) {
      return res.status(404).json({ message: "One or more flights not found" });
    }

    const bookingPassengers = Array.isArray(booking.passengers) ? booking.passengers : [];

    for (let flightIndex = 0; flightIndex < flights.length; flightIndex += 1) {
      const flight = flights[flightIndex];
      await ensureFlightSeats(flight);

      const requestedSeatNumbers = bookingPassengers
        .map((passenger) => passenger.seatNumber)
        .filter(Boolean)
        .map((seatNumber) => String(seatNumber).toUpperCase());
      const uniqueSeatNumbers = new Set(requestedSeatNumbers);

      if (uniqueSeatNumbers.size !== requestedSeatNumbers.length) {
        return res.status(400).json({ message: "Duplicate seat selection in booking" });
      }

      const selectedSeats = [];
      for (const seatNumber of requestedSeatNumbers) {
        const seat = flight.seats.find(
          (item) => String(item.seatNumber).toUpperCase() === seatNumber
        );

        if (!seat) {
          return res.status(400).json({
            message: `Seat ${seatNumber} not found in ${flight.airline}`
          });
        }

        if (seat.isBooked) {
          return res.status(400).json({
            message: `Seat ${seatNumber} already booked`
          });
        }

        selectedSeats.push(seat);
      }

      const freeSeats = flight.seats.filter(
        (item) =>
          !item.isBooked &&
          !uniqueSeatNumbers.has(String(item.seatNumber).toUpperCase())
      );

      if (selectedSeats.length + freeSeats.length < bookingPassengers.length) {
        return res.status(400).json({
          message: `Not enough seats in ${flight.airline}`
        });
      }

      while (selectedSeats.length < bookingPassengers.length) {
        selectedSeats.push(freeSeats.shift());
      }

      if (flightIndex === 0) {
        for (let i = 0; i < bookingPassengers.length; i += 1) {
          if (!bookingPassengers[i].seatNumber && selectedSeats[i]) {
            bookingPassengers[i].seatNumber = selectedSeats[i].seatNumber;
          }
        }
      }

      for (const seat of selectedSeats) {
        seat.isBooked = true;
      }

      flight.availableSeats = flight.seats.filter((item) => !item.isBooked).length;
      await flight.save();
    }

    await booking.save();

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
    for (const flight of booking.flights) {
      await ensureFlightSeats(flight);

      for (const passenger of booking.passengers) {
        if (!passenger.seatNumber) continue;

        const normalizedSeatNumber = String(passenger.seatNumber).toUpperCase();
        const seat = flight.seats.find(
          (item) => String(item.seatNumber).toUpperCase() === normalizedSeatNumber
        );

        if (seat) {
          seat.isBooked = false;
        }
      }

      flight.availableSeats = flight.seats.filter((item) => !item.isBooked).length;
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
router.get("/:flightId/seat/:seatNumber", async (req, res) => {
  try {
    const { flightId, seatNumber } = req.params;

    const flight = await Flight.findById(flightId);

    if (!flight)
      return res.status(404).json({ message: "Flight not found" });

    await ensureFlightSeats(flight);

    const normalizedSeatNumber = String(seatNumber).toUpperCase();
    const seat = flight.seats.find(
      s => String(s.seatNumber).toUpperCase() === normalizedSeatNumber
    );

    if (!seat)
      return res.status(404).json({ message: "Seat not found" });

    res.json(seat);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching seat" });
  }
});

/**
 * GET FLIGHT BY ID (Keep this LAST)
 */
router.get("/:flightId", async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.flightId);

    if (!flight)
      return res.status(404).json({ message: "Flight not found" });

    res.json(flight);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch flight" });
  }
});


module.exports = router;
