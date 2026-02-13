const express = require("express");
const Flight = require("../models/Flight");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * Add Flight (Protected)
 */
router.post("/add", authMiddleware, async (req, res) => {
  try {
    const flight = new Flight(req.body);
    await flight.save();

    res.json({ message: "Flight added successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to add flight" });
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

module.exports = router;

