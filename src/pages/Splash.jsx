import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Splash() {
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const email = storedUser?.email || "";
  const namePart = email ? email.split("@")[0] : "Traveler";
  const greetingName =
    namePart.charAt(0).toUpperCase() + namePart.slice(1).toLowerCase();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      navigate("/trip", { replace: true });
    }, 1800);

    return () => window.clearTimeout(timer);
  }, [navigate]);

  return (
    <section className="splash-page">
      <div className="splash-orb" />
      <div className="splash-card">
        <p className="eyebrow">Welcome Aboard</p>
        <h1 className="splash-title">{greetingName}</h1>
        <p className="splash-subtitle">
          Preparing your flight dashboard and latest route inventory.
        </p>
        <div className="splash-loader" />
      </div>
    </section>
  );
}

export default Splash;
