import { BrowserRouter, Routes, Route } from "react-router-dom";
import SearchFlights from "./pages/SearchFlights";
import FlightList from "./pages/FlightList";
import TravelerInfo from "./pages/TravelerInfo";

function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Routes>
          <Route path="/" element={<SearchFlights />} />
          <Route path="/flights" element={<FlightList />} />
          <Route path="/traveler-info" element={<TravelerInfo />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
