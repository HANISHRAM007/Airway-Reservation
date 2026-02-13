require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/auth");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/airway");

app.use("/api/auth", authRoutes);
app.use("/api/flights", require("./routes/flight"));
app.use("/api/booking", require("./routes/booking"));
app.use("/tickets", express.static("tickets"));


app.listen(5000, () =>
  console.log("Server running on port 5000")
);
