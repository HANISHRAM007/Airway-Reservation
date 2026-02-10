const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Airway Backend Running");
});

app.get("/api/flights", (req, res) => {
  res.json([
    {
      flightNo: "AI-101",
      from: "DEL",
      to: "MAA",
      flightName: "Air India",
      price: 4500
    },
    {
      flightNo: "IN-202",
      from: "BLR",
      to: "BOM",
      flightName: "IndiGo",
      price: 3800
    }
  ]);
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
