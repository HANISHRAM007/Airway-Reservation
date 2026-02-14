const express = require("express");
const Flight = require("../models/Flight");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * Add Flight (Protected)
 */
router.post("/add", authMiddleware, async (req, res) => {
  try {
    const { airline, from, to, price } = req.body;

    const seats = [];
    const rows = 10;
    const cols = ["A", "B", "C", "D"];

    for (let i = 1; i <= rows; i++) {
      for (let col of cols) {
        seats.push({
          seatNumber: i + col,
          isBooked: false
        });
      }
    }

    const flight = new Flight({
      airline,
      from,
      to,
      price,
      seats
    });

    await flight.save();

    res.json({ message: "Flight added successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add flight" });
  }
});;

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

module.exports = router;

