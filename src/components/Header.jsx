import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  useTheme,
} from "../context/ThemeContext";

import pitechLight
  from "../assets/pitech-light.png";

import pitechDark
  from "../assets/pitech-dark.png";

import "./Header.css";


function Header({
  onMenuClick,
}) {
  const {
    mode,
  } = useTheme();


  const location =
    useLocation();

  const navigate =
    useNavigate();


  const pitechLogo =
    mode === "dark"
      ? pitechDark
      : pitechLight;


  const isRackDetails =
    location.pathname
      .startsWith(
        "/location/"
      );


  const isTagManagementActivity =
    location.pathname
      .startsWith(
        "/tag-management/"
      );


  const showHome =
    isRackDetails ||
    isTagManagementActivity;


  const handleHome =
    () => {
      if (
        isTagManagementActivity
      ) {
        navigate(
          "/tag-management"
        );

        return;
      }

      navigate("/");
    };


  return (
    <header className="app-header">

      {/* LEFT */}

      <div className="header-brand-zone">

        {onMenuClick && (
          <button
            type="button"
            className="mobile-menu-btn"
            onClick={
              onMenuClick
            }
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        )}


        <img
          className="pitech-logo"
          src={pitechLogo}
          alt="Pitech"
        />

      </div>


      {/* CENTER */}

      <div className="header-title-zone">

        <div className="rack-system-title">

          <span className="rack-title-highlight">
            RACK
          </span>

          <span className="rack-title-main">
            MANAGEMENT SYSTEM
          </span>

        </div>


        <div className="rack-title-line">

          <span></span>

          <p>
            SMART RACK • TAG • BIN TRACKING
          </p>

          <span></span>

        </div>

      </div>


      {/* RIGHT */}

      <div className="customer-logo-zone">

        {showHome && (
          <button
            type="button"
            className="header-home-button"
            onClick={
              handleHome
            }
          >

            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m3 11 9-8 9 8" />
              <path d="M5 10v10h14V10" />
              <path d="M9 20v-6h6v6" />
            </svg>

            <span>
              Home
            </span>

          </button>
        )}

      </div>

    </header>
  );
}

export default Header;