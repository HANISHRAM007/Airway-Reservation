require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const flightRoutes = require("./routes/flight");

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));
app.use("/api/auth", authRoutes);
app.use("/api/flights", flightRoutes);
app.use("/api/flight", flightRoutes);
app.use("/api/booking", require("./routes/booking"));
app.use("/tickets", express.static("tickets"));


app.listen(5000, () =>
  console.log("Server running on port 5000")
);
