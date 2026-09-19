import { useNavigate } from "react-router-dom";
import { locations } from "../data/locationData";
import "./Dashboard.css";

function LocationIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function RackIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M4 9h16" />
      <path d="M4 15h16" />
      <path d="M8 6h1" />
      <path d="M8 12h1" />
      <path d="M8 18h1" />
    </svg>
  );
}

function StatusIcon({ status }) {
  if (status === "FULL RACK") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="4" y="4" width="16" height="16" rx="3" />
        <path d="M8 9h8" />
        <path d="M8 12h8" />
        <path d="M8 15h8" />
      </svg>
    );
  }

  if (status === "EMPTY RACK") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="4" y="4" width="16" height="16" rx="3" />
      </svg>
    );
  }

  if (status === "START OUT BIN") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 12h13" />
        <path d="m14 7 5 5-5 5" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 12H6" />
      <path d="m10 7-5 5 5 5" />
    </svg>
  );
}

function getStatusClass(status) {
  switch (status) {
    case "FULL RACK":
      return "status-full";

    case "EMPTY RACK":
      return "status-empty";

    case "START OUT BIN":
      return "status-out";

    case "START IN BIN":
      return "status-in";

    default:
      return "";
  }
}

function Dashboard() {
  const navigate = useNavigate();

  const handleLocationClick = (item) => {
    navigate(`/location/${item.location}`);
  };

  return (
    <div className="dashboard-page">

      <div className="dashboard-effects">
        <span className="dashboard-grid-lines"></span>
        <span className="dashboard-orb orb-one"></span>
        <span className="dashboard-orb orb-two"></span>
        <span className="dashboard-orb orb-three"></span>
      </div>

      <div className="location-grid">

        {locations.map((item, index) => (
          <button
            key={item.id}
            type="button"
            className="location-card"
            style={{
              "--card-index": index,
            }}
            onClick={() => handleLocationClick(item)}
          >

            <span className="card-shine"></span>

            <span className="card-decoration decoration-one"></span>
            <span className="card-decoration decoration-two"></span>

            <div className="card-left">

              <div className="location-section">

                <div className="location-icon">
                  <LocationIcon />
                  <span className="location-icon-pulse"></span>
                </div>

                <div className="location-content">
                  <span className="small-label">
                    LOCATION
                  </span>

                  <h2>
                    {item.location}
                  </h2>
                </div>

              </div>

              <div className="total-rack-section">

                <RackIcon />

                <div className="rack-count">
                  <strong>
                    {item.totalRacks}
                  </strong>

                  <span>
                    TOTAL RACK
                  </span>
                </div>

              </div>

            </div>

            <span className="card-separator"></span>

            <div
              className={`status-section ${getStatusClass(
                item.status
              )}`}
            >

              <span className="status-title">
                CURRENT STATUS
              </span>

              <div className="status-content">

                <div className="status-icon">
                  <StatusIcon status={item.status} />
                </div>

                <div className="status-name">

                  <span className="status-indicator"></span>

                  <strong>
                    {item.status}
                  </strong>

                </div>

              </div>

            </div>

            <div className="card-bottom-line">
              <span></span>
            </div>

          </button>
        ))}

      </div>
    </div>
  );
}

export default Dashboard;