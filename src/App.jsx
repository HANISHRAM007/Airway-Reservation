import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import FlightList from "./pages/FlightList";
import Login from "./pages/Login";
import Payment from "./pages/Payment";
import SearchFlights from "./pages/SearchFlights";
import Splash from "./pages/Splash";
import TravelerInfo from "./pages/TravelerInfo";

function RootRedirect() {
  const token = localStorage.getItem("token");
  return <Navigate to={token ? "/splash" : "/login"} replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/splash"
          element={
            <ProtectedRoute>
              <Splash />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trip"
          element={
            <ProtectedRoute>
              <SearchFlights />
            </ProtectedRoute>
          }
        />
        <Route
          path="/flights"
          element={
            <ProtectedRoute>
              <FlightList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/traveler-info"
          element={
            <ProtectedRoute>
              <TravelerInfo />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment/:bookingId"
          element={
            <ProtectedRoute>
              <Payment />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
