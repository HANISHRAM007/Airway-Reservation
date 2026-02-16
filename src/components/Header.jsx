import { Link, useNavigate } from "react-router-dom";

function Header({ title, subtitle }) {
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const email = storedUser?.email || "";
  const displayName = email ? email.split("@")[0] : "Traveler";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("tripSearch");
    sessionStorage.removeItem("bookingDraft");
    sessionStorage.removeItem("paymentDraft");
    navigate("/login", { replace: true });
  };

  return (
    <header className="topbar">
      <div className="topbar__left">
        <p className="topbar__brand">Airway Admin</p>
        <h1 className="topbar__title">{title}</h1>
        {subtitle ? <p className="topbar__subtitle">{subtitle}</p> : null}
      </div>
      <div className="topbar__right">
        <p className="topbar__user">Hi, {displayName}</p>
        <nav className="topbar__nav">
          <Link to="/trip" className="ghost-link">
            Search
          </Link>
          <button type="button" className="ghost-link" onClick={handleLogout}>
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
}

export default Header;
