import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "../api/axios";
import FlightCard from "../components/FlightCard";
import Header from "../components/Header";

function formatDateLocal(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function sortByDeparture(list) {
  return [...list].sort((a, b) => {
    const aTime = new Date(a.departureTime).getTime();
    const bTime = new Date(b.departureTime).getTime();
    return aTime - bTime;
  });
}

function FlightList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchContext, setSearchContext] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [onwardFlights, setOnwardFlights] = useState([]);
  const [returnFlights, setReturnFlights] = useState([]);

  const [selectedOnwardId, setSelectedOnwardId] = useState("");
  const [selectedReturnId, setSelectedReturnId] = useState("");

  useEffect(() => {
    const stored = sessionStorage.getItem("tripSearch");
    let parsed = {};

    if (stored) {
      try {
        parsed = JSON.parse(stored);
      } catch (parseError) {
        console.error("Failed to parse stored trip search", parseError);
      }
    }

    const from = (searchParams.get("from") || parsed.from || "").toUpperCase();
    const to = (searchParams.get("to") || parsed.to || "").toUpperCase();
    const departureDate =
      searchParams.get("departureDate") || parsed.departureDate || "";
    const returnDate = searchParams.get("returnDate") || parsed.returnDate || "";
    const tripType = searchParams.get("tripType") || parsed.tripType || "ONE_WAY";

    const passengers = parsed.passengers || {
      adults: 1,
      children: 0,
      infants: 0,
      total: 1,
    };

    const context = {
      from,
      to,
      departureDate,
      returnDate,
      tripType,
      passengers,
    };

    if (!from || !to || !departureDate) {
      navigate("/trip", { replace: true });
      return;
    }

    sessionStorage.setItem("tripSearch", JSON.stringify(context));
    setSearchContext(context);
  }, [navigate, searchParams]);

  useEffect(() => {
    if (!searchContext) return;

    const fetchFlights = async () => {
      setLoading(true);
      setError("");

      try {
        const onwardResponse = await axios.get("/flights", {
          params: {
            from: searchContext.from,
            to: searchContext.to,
          },
        });

        const onwardList = Array.isArray(onwardResponse.data)
          ? onwardResponse.data
          : [];

        const filteredOnward = onwardList.filter((flight) => {
          const sameDate =
            formatDateLocal(flight.departureTime) === searchContext.departureDate;
          const enoughSeats =
            Number(flight.availableSeats || 0) >= Number(searchContext.passengers.total || 1);
          return sameDate && enoughSeats;
        });

        setOnwardFlights(sortByDeparture(filteredOnward));

        if (searchContext.tripType === "ROUND_TRIP") {
          const returnResponse = await axios.get("/flights", {
            params: {
              from: searchContext.to,
              to: searchContext.from,
            },
          });

          const returnList = Array.isArray(returnResponse.data)
            ? returnResponse.data
            : [];

          const filteredReturn = returnList.filter((flight) => {
            const sameDate =
              formatDateLocal(flight.departureTime) === searchContext.returnDate;
            const enoughSeats =
              Number(flight.availableSeats || 0) >=
              Number(searchContext.passengers.total || 1);
            return sameDate && enoughSeats;
          });

          setReturnFlights(sortByDeparture(filteredReturn));
        } else {
          setReturnFlights([]);
        }
      } catch (apiError) {
        setError(
          apiError.response?.data?.message ||
            "Unable to fetch flights for selected route/date."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchFlights();
  }, [searchContext]);

  const visibleOnwardFlights = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return onwardFlights;

    return onwardFlights.filter((flight) => {
      const airline = String(flight.airline || "").toLowerCase();
      const number = String(flight.flightNumber || flight.flightNo || "").toLowerCase();
      return airline.includes(keyword) || number.includes(keyword);
    });
  }, [onwardFlights, searchTerm]);

  const visibleReturnFlights = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return returnFlights;

    return returnFlights.filter((flight) => {
      const airline = String(flight.airline || "").toLowerCase();
      const number = String(flight.flightNumber || flight.flightNo || "").toLowerCase();
      return airline.includes(keyword) || number.includes(keyword);
    });
  }, [returnFlights, searchTerm]);

  const selectedOnward = onwardFlights.find((f) => f._id === selectedOnwardId) || null;
  const selectedReturn = returnFlights.find((f) => f._id === selectedReturnId) || null;

  const canContinue =
    !!selectedOnward &&
    (searchContext?.tripType === "ONE_WAY" || !!selectedReturn);

  const handleContinue = () => {
    if (!searchContext || !selectedOnward) return;

    const selectedFlights = [selectedOnward];
    if (searchContext.tripType === "ROUND_TRIP" && selectedReturn) {
      selectedFlights.push(selectedReturn);
    }

    const bookingDraft = {
      search: searchContext,
      flights: selectedFlights,
      flightIds: selectedFlights.map((item) => item._id),
    };

    sessionStorage.setItem("bookingDraft", JSON.stringify(bookingDraft));
    navigate("/traveler-info");
  };

  if (!searchContext) return null;

  const totalPassengers = Number(searchContext.passengers.total || 1);

  return (
    <section className="page">
      <Header
        title="Available Flights"
        subtitle="Step 2: choose your onward flight and return flight (if round-trip)."
      />

      <div className="panel">
        <div className="chip-row">
          <span className="chip">{`${searchContext.from} -> ${searchContext.to}`}</span>
          <span className="chip">{searchContext.departureDate}</span>
          {searchContext.tripType === "ROUND_TRIP" ? (
            <span className="chip">Return: {searchContext.returnDate}</span>
          ) : null}
          <span className="chip">Passengers: {totalPassengers}</span>
          <span className="chip">
            {searchContext.tripType === "ROUND_TRIP" ? "Round-trip" : "One-way"}
          </span>
        </div>

        <div className="field">
          <label htmlFor="flight-search">Search flights</label>
          <input
            id="flight-search"
            placeholder="Filter by airline or flight number"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? <p className="helper-text">Loading flights...</p> : null}
        {error ? <p className="error">{error}</p> : null}

        <div className="section-stack">
          <section>
            <h3 className="section-title">Onward Flights</h3>
            {visibleOnwardFlights.length === 0 ? (
              <div className="empty-state">
                <h3>No onward flights</h3>
                <p>Try changing date, route, or passenger count.</p>
              </div>
            ) : (
              <div className="flight-grid">
                {visibleOnwardFlights.map((flight) => (
                  <FlightCard
                    key={flight._id}
                    flightNo={flight.flightNumber || flight.flightNo}
                    from={flight.from}
                    to={flight.to}
                    flightName={flight.airline || "Flight"}
                    price={flight.price}
                    departureTime={flight.departureTime}
                    arrivalTime={flight.arrivalTime}
                    availableSeats={flight.availableSeats}
                    selected={selectedOnwardId === flight._id}
                    buttonLabel="Book Now"
                    onSelect={() => setSelectedOnwardId(flight._id)}
                  />
                ))}
              </div>
            )}
          </section>

          {searchContext.tripType === "ROUND_TRIP" ? (
            <section>
              <h3 className="section-title">Return Flights</h3>
              {visibleReturnFlights.length === 0 ? (
                <div className="empty-state">
                  <h3>No return flights</h3>
                  <p>Try another return date for this route.</p>
                </div>
              ) : (
                <div className="flight-grid">
                  {visibleReturnFlights.map((flight) => (
                    <FlightCard
                      key={flight._id}
                      flightNo={flight.flightNumber || flight.flightNo}
                      from={flight.from}
                      to={flight.to}
                      flightName={flight.airline || "Flight"}
                      price={flight.price}
                      departureTime={flight.departureTime}
                      arrivalTime={flight.arrivalTime}
                      availableSeats={flight.availableSeats}
                      selected={selectedReturnId === flight._id}
                      buttonLabel="Book Return"
                      onSelect={() => setSelectedReturnId(flight._id)}
                    />
                  ))}
                </div>
              )}
            </section>
          ) : null}
        </div>

        <div className="page-actions">
          <button
            type="button"
            className="subtle-btn"
            onClick={() => navigate("/trip")}
          >
            Edit Search
          </button>
          <button
            type="button"
            className="primary-btn"
            onClick={handleContinue}
            disabled={!canContinue}
          >
            Continue to Demography Details
          </button>
        </div>
      </div>
    </section>
  );
}

export default FlightList;
