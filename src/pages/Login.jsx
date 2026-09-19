import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import trmnLogo from "../assets/trmn-logo.png";
import poweredByPitech from "../assets/pitech-powered.png";
import "./Auth.css";

const REMEMBERED_USERNAME_KEY = "rms-remembered-username";

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 21a8 8 0 0 0-16 0" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="5" y="10" width="14" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function EyeIcon({ open }) {
  return open ? (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m3 3 18 18" />
      <path d="M10.6 6.2A11.7 11.7 0 0 1 12 6c6.5 0 10 6 10 6a17 17 0 0 1-2.1 2.8" />
      <path d="M6.6 6.7C3.6 8.5 2 12 2 12s3.5 6 10 6c1.8 0 3.3-.4 4.6-1" />
    </svg>
  );
}

function RailIcon({ type }) {
  const common = {
    viewBox: "0 0 24 24",
    "aria-hidden": "true",
  };

  if (type === "tag") {
    return (
      <svg {...common}>
        <path d="M5 4v16M8 4v16M11 4v16M15 4v16M18 4v16" />
      </svg>
    );
  }

  if (type === "rack") {
    return (
      <svg {...common}>
        <rect x="3" y="3" width="7" height="5" rx="1" />
        <rect x="14" y="16" width="7" height="5" rx="1" />
        <rect x="3" y="16" width="7" height="5" rx="1" />
        <path d="M6.5 8v4h11v4M17.5 8v4" />
      </svg>
    );
  }

  if (type === "chart") {
    return (
      <svg {...common}>
        <path d="M12 3v9h9" />
        <path d="M20.2 15.4A9 9 0 1 1 8.6 3.8" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M12 3 19 6v5c0 4.5-2.6 8-7 10-4.4-2-7-5.5-7-10V6l7-3Z" />
      <path d="m9.3 12 1.8 1.8 3.8-4" />
    </svg>
  );
}

function FeatureRail() {
  const items = [
    ["tag", "TAG", "TRACKING"],
    ["rack", "RACK", "MANAGEMENT"],
    ["chart", "REAL-TIME", "VISIBILITY"],
    ["shield", "SECURE", "ACCESS"],
  ];

  return (
    <aside className="auth-feature-rail" aria-hidden="true">
      {items.map(([type, line1, line2]) => (
        <div className="auth-rail-item" key={type}>
          <span className="auth-rail-icon"><RailIcon type={type} /></span>
          <strong>{line1}<br />{line2}</strong>
        </div>
      ))}
    </aside>
  );
}

function AuthBrand() {
  return (
    <div className="auth-brand-center" aria-label="TRMN Rack Management System">
      <img src={trmnLogo} alt="TRMN" draggable="false" />
      <div className="auth-system-name">RACK MANAGEMENT SYSTEM</div>
      <div className="auth-system-tagline">TRACK <i /> MANAGE <i /> OPTIMIZE</div>
    </div>
  );
}

function Login() {
  const navigate = useNavigate();
  const { login, resetPassword, isAuthenticated, firstAllowedPath } = useAuth();

  const [username, setUsername] = useState(
    () => localStorage.getItem(REMEMBERED_USERNAME_KEY) || ""
  );
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(
    () => Boolean(localStorage.getItem(REMEMBERED_USERNAME_KEY))
  );
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [resetMode, setResetMode] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      navigate(firstAllowedPath(), { replace: true });
    }
  }, [isAuthenticated, navigate, firstAllowedPath]);

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");
    setNotice("");

    const result = login({ username, password, remember });

    if (!result.success) {
      setError(result.message);
      return;
    }

    if (remember) {
      localStorage.setItem(REMEMBERED_USERNAME_KEY, username.trim());
    } else {
      localStorage.removeItem(REMEMBERED_USERNAME_KEY);
    }

    navigate(firstAllowedPath(result.user), { replace: true });
  };

  const handleReset = (event) => {
    event.preventDefault();
    setError("");
    setNotice("");

    const result = resetPassword({ username, newPassword });

    if (!result.success) {
      setError(result.message);
      return;
    }

    setNotice(result.message);
    setPassword("");
    setNewPassword("");
    setResetMode(false);
  };

  return (
    <main className="auth-page auth-login-page">
      <div className="auth-overlay" />
      <AuthBrand />

      <section className="auth-stage auth-login-stage">
        <div className="auth-card auth-login-card">
          <div className="auth-card-head">
            <h1>{resetMode ? "Reset Password" : "Welcome Back"}</h1>
            <p>
              {resetMode
                ? "Update the password for your registered account."
                : "Login to access your account"}
            </p>
          </div>

          {!resetMode ? (
            <form className="auth-form" onSubmit={handleSubmit}>
              <label className="auth-input-wrap" htmlFor="loginUsername">
                <span className="auth-input-icon"><UserIcon /></span>
                <input
                  id="loginUsername"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  autoComplete="username"
                  placeholder="Username"
                  required
                />
              </label>

              <label className="auth-input-wrap" htmlFor="loginPassword">
                <span className="auth-input-icon"><LockIcon /></span>
                <input
                  id="loginPassword"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  placeholder="Password"
                  required
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((current) => !current)}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </label>

              <div className="auth-form-options">
                <label className="auth-check-label">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(event) => setRemember(event.target.checked)}
                  />
                  <span>Remember me</span>
                </label>

                <button
                  type="button"
                  className="auth-link-btn"
                  onClick={() => {
                    setResetMode(true);
                    setError("");
                    setNotice("");
                  }}
                >
                  Forgot Password?
                </button>
              </div>

              {error && <div className="auth-error">{error}</div>}
              {notice && <div className="auth-success">{notice}</div>}

              <button className="auth-primary-btn" type="submit">
                <span>Login</span>
                <span className="auth-btn-arrow">→</span>
              </button>
            </form>
          ) : (
            <form className="auth-form" onSubmit={handleReset}>
              <label className="auth-input-wrap" htmlFor="resetUsername">
                <span className="auth-input-icon"><UserIcon /></span>
                <input
                  id="resetUsername"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  autoComplete="username"
                  placeholder="Registered username"
                  required
                />
              </label>

              <label className="auth-input-wrap" htmlFor="resetPassword">
                <span className="auth-input-icon"><LockIcon /></span>
                <input
                  id="resetPassword"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  autoComplete="new-password"
                  placeholder="New password"
                  required
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  aria-label="Show or hide password"
                  onClick={() => setShowPassword((current) => !current)}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </label>

              {error && <div className="auth-error">{error}</div>}
              {notice && <div className="auth-success">{notice}</div>}

              <button className="auth-primary-btn" type="submit">
                <span>Update Password</span>
                <span className="auth-btn-arrow">→</span>
              </button>

              <button
                type="button"
                className="auth-secondary-btn"
                onClick={() => {
                  setResetMode(false);
                  setError("");
                }}
              >
                Back to Login
              </button>
            </form>
          )}

          {!resetMode && (
            <div className="auth-register-prompt">
              <div className="auth-divider">
                <span />
                <small>Don&apos;t have an account?</small>
                <span />
              </div>
              <Link className="auth-secondary-btn" to="/register">
                Create New Account
              </Link>
            </div>
          )}
        </div>
      </section>

      <FeatureRail />

      <div className="auth-corner-copy" aria-hidden="true">
        <span />
        Building Smarter<br />Tracking Solutions
      </div>

      <img
        className="auth-pitech-footer"
        src={poweredByPitech}
        alt="Powered by Pitech"
        draggable="false"
      />
    </main>
  );
}

export default Login;
