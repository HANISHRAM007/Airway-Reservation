import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import Header from "../components/Header";

function buildPassengerTemplate(index, passengerTypes) {
  return {
    type: passengerTypes[index] || "Adult",
    name: "",
    age: "",
    gender: "",
    seatNumber: "",
  };
}

function TravelerInfo() {
  const navigate = useNavigate();
  const [bookingDraft, setBookingDraft] = useState(null);
  const [passengers, setPassengers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = sessionStorage.getItem("bookingDraft");
    if (!stored) {
      navigate("/trip", { replace: true });
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      if (!parsed?.flights?.length) {
        navigate("/trip", { replace: true });
        return;
      }

      setBookingDraft(parsed);
    } catch (parseError) {
      console.error("Failed to parse booking draft", parseError);
      navigate("/trip", { replace: true });
    }
  }, [navigate]);

  const passengerTypes = useMemo(() => {
    const adults = Number(bookingDraft?.search?.passengers?.adults || 0);
    const children = Number(bookingDraft?.search?.passengers?.children || 0);
    const infants = Number(bookingDraft?.search?.passengers?.infants || 0);

    const list = [];
    for (let i = 0; i < adults; i += 1) list.push("Adult");
    for (let i = 0; i < children; i += 1) list.push("Child");
    for (let i = 0; i < infants; i += 1) list.push("Infant");

    return list.length > 0 ? list : ["Adult"];
  }, [bookingDraft]);

  useEffect(() => {
    if (!bookingDraft) return;

    setPassengers((prev) => {
      if (prev.length === passengerTypes.length) return prev;
      return passengerTypes.map((_, index) =>
        prev[index] || buildPassengerTemplate(index, passengerTypes)
      );
    });
  }, [bookingDraft, passengerTypes]);

  const handleFieldChange = (index, field, value) => {
    setPassengers((prev) =>
      prev.map((item, idx) =>
        idx === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  const validatePassengers = () => {
    for (let i = 0; i < passengers.length; i += 1) {
      const passenger = passengers[i];
      if (!passenger.name.trim()) {
        return `Passenger ${i + 1}: name is required.`;
      }

      if (!passenger.age || Number(passenger.age) <= 0) {
        return `Passenger ${i + 1}: valid age is required.`;
      }

      if (!passenger.gender) {
        return `Passenger ${i + 1}: gender is required.`;
      }

      if (passenger.type === "Infant" && Number(passenger.age) > 2) {
        return `Passenger ${i + 1}: infant age must be 2 or below.`;
      }

      if (passenger.type === "Child" && Number(passenger.age) > 11) {
        return `Passenger ${i + 1}: child age must be 11 or below.`;
      }
    }

    return "";
  };

  const createBooking = async (event) => {
    event.preventDefault();
    setError("");

    const validationError = validatePassengers();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!bookingDraft?.flightIds?.length) {
      setError("Flight selection is missing. Please start search again.");
      return;
    }

    const payloadPassengers = passengers.map((passenger) => ({
      name: passenger.name.trim(),
      age: Number(passenger.age),
      gender: passenger.gender,
      seatNumber: passenger.seatNumber.trim().toUpperCase(),
    }));

    setSubmitting(true);
    try {
      const response = await axios.post("/booking/create", {
        flightIds: bookingDraft.flightIds,
        passengers: payloadPassengers,
      });

      const paymentDraft = {
        ...bookingDraft,
        passengers: payloadPassengers,
        bookingId: response.data?.bookingId,
        totalAmount: response.data?.totalAmount || 0,
      };

      sessionStorage.setItem("paymentDraft", JSON.stringify(paymentDraft));

      navigate(`/payment/${response.data?.bookingId}`, {
        state: {
          bookingId: response.data?.bookingId,
          totalAmount: response.data?.totalAmount || 0,
        },
      });
    } catch (apiError) {
      setError(
        apiError.response?.data?.message ||
          "Booking creation failed. Please verify details and retry."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!bookingDraft) return null;

  const selectedFlights = bookingDraft.flights || [];

  return (
    <section className="page">
      <Header
        title="Demography Details"
        subtitle="Step 3: enter passenger information for the selected passenger count."
      />

      <div className="panel">
        <header className="page-header">
          <p className="eyebrow">Step 3</p>
          <h2 className="title">Passenger Details</h2>
          <p className="subtitle">
            Fill traveler details exactly as per ID proof. This data will be
            stored with booking details.
          </p>
        </header>

        <div className="flight-summary">
          <div>
            <p className="summary-label">Trip Type</p>
            <p className="summary-value">
              {bookingDraft.search?.tripType === "ROUND_TRIP" ? "Round-trip" : "One-way"}
            </p>
          </div>
          <div>
            <p className="summary-label">Selected Flights</p>
            <p className="summary-value">{selectedFlights.length}</p>
          </div>
          <div>
            <p className="summary-label">Passengers</p>
            <p className="summary-value">{passengerTypes.length}</p>
          </div>
        </div>

        <div className="chip-row">
          {selectedFlights.map((flight) => (
            <span key={flight._id} className="chip">
              {(flight.airline || "Flight") + " (" + (flight.flightNumber || "NA") + ")"}
            </span>
          ))}
        </div>

        <form className="search-form" onSubmit={createBooking}>
          {passengers.map((passenger, index) => (
            <div className="form-section" key={`passenger-${index}`}>
              <h3 className="section-title">
                Passenger {index + 1} ({passenger.type})
              </h3>

              <div className="form-grid">
                <div className="field">
                  <label htmlFor={`name-${index}`}>Full name</label>
                  <input
                    id={`name-${index}`}
                    value={passenger.name}
                    placeholder="Enter full name"
                    onChange={(e) => handleFieldChange(index, "name", e.target.value)}
                  />
                </div>

                <div className="field">
                  <label htmlFor={`age-${index}`}>Age</label>
                  <input
                    id={`age-${index}`}
                    type="number"
                    min="0"
                    value={passenger.age}
                    placeholder="Age"
                    onChange={(e) => handleFieldChange(index, "age", e.target.value)}
                  />
                </div>

                <div className="field">
                  <label htmlFor={`gender-${index}`}>Gender</label>
                  <select
                    id={`gender-${index}`}
                    value={passenger.gender}
                    onChange={(e) => handleFieldChange(index, "gender", e.target.value)}
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="field">
                  <label htmlFor={`seat-${index}`}>Preferred Seat (optional)</label>
                  <input
                    id={`seat-${index}`}
                    value={passenger.seatNumber}
                    placeholder="e.g. A1"
                    onChange={(e) =>
                      handleFieldChange(index, "seatNumber", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          ))}

          {error ? <p className="error">{error}</p> : null}

          <div className="page-actions">
            <button
              type="button"
              className="subtle-btn"
              onClick={() => navigate("/flights")}
            >
              Back to Flights
            </button>
            <button className="primary-btn" type="submit" disabled={submitting}>
              {submitting ? "Creating Booking..." : "Book Now"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default TravelerInfo;
