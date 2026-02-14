const express = require("express");
const Flight = require("../models/Flight");
const authMiddleware = require("../middleware/authMiddleware");
const { buildSeatMap, ensureFlightSeats } = require("../utils/seatMap");

const router = express.Router();

/**
 * Add Flight (Protected)
 */
router.post("/add", authMiddleware, async (req, res) => {
  try {
    const {
      flightNumber,
      airline,
      from,
      to,
      departureTime,
      arrivalTime,
      price,
      totalSeats
    } = req.body;

    const seats = buildSeatMap(totalSeats);

    const flight = new Flight({
      flightNumber,
      airline,
      from,
      to,
      departureTime,
      arrivalTime,
      price,
      totalSeats: seats.length,
      availableSeats: seats.length,
      seats
    });

    await flight.save();

    res.json({ message: "Flight added successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add flight" });
  }
});

/**
 * List Flights (Public)
 * Optional query params: from, to
 */
router.get("/", async (req, res) => {
  try {
    const { from, to } = req.query;
    const query = {};

    if (from) query.from = from;
    if (to) query.to = to;

    const flights = await Flight.find(query);
    res.json(flights);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch flights" });
  }
});

/**
 * Search Flights (Public)
 */
router.get("/search", async (req, res) => {
  try {
    const { from, to } = req.query;

    const flights = await Flight.find({
      from,
      to
    });

    res.json(flights);
  } catch (err) {
    res.status(500).json({ message: "Search failed" });
  }
});

/**
 * Get all seats for a flight (Public)
 */
router.get("/:flightId/seats", async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.flightId);

    if (!flight) {
      return res.status(404).json({ message: "Flight not found" });
    }

    await ensureFlightSeats(flight);

    res.json({
      flightId: req.params.flightId,
      seats: flight.seats
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch seats" });
  }
});

/**
 * Get flight by id (Public)
 */
router.get("/:flightId", async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.flightId);

    if (!flight) {
      return res.status(404).json({ message: "Flight not found" });
    }

    res.json(flight);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch flight" });
  }
});

module.exports = router;

