import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PAGE_OPTIONS, ROLE_PRESETS, useAuth } from "../context/AuthContext";
import trmnLogo from "../assets/trmn-logo.png";
import poweredByPitech from "../assets/pitech-powered.png";
import "./Auth.css";

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

  return (
    <svg {...common}>
      <path d="M12 3 19 6v5c0 4.5-2.6 8-7 10-4.4-2-7-5.5-7-10V6l7-3Z" />
      <path d="m9.3 12 1.8 1.8 3.8-4" />
    </svg>
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

function FeatureRail() {
  const items = [
    ["tag", "TAG", "TRACKING"],
    ["rack", "RACK", "MANAGEMENT"],
    ["shield", "ROLE-BASED", "ACCESS"],
  ];

  return (
    <aside className="auth-feature-rail auth-register-rail" aria-hidden="true">
      {items.map(([type, line1, line2]) => (
        <div className="auth-rail-item" key={`${type}-${line1}`}>
          <span className="auth-rail-icon"><RailIcon type={type} /></span>
          <strong>{line1}<br />{line2}</strong>
        </div>
      ))}
    </aside>
  );
}

function Register() {
  const navigate = useNavigate();
  const { register, isAuthenticated, firstAllowedPath } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [accessType, setAccessType] = useState("USER");
  const [permissions, setPermissions] = useState([...ROLE_PRESETS.USER]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      navigate(firstAllowedPath(), { replace: true });
    }
  }, [isAuthenticated, navigate, firstAllowedPath]);

  const selectRole = (role) => {
    setAccessType(role);
    setPermissions([...ROLE_PRESETS[role]]);
    setError("");
  };

  const togglePermission = (key) => {
    setPermissions((current) =>
      current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key]
    );
    setError("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Password and confirm password do not match.");
      return;
    }

    const result = register({
      username,
      password,
      accessType,
      permissions,
    });

    if (!result.success) {
      setError(result.message);
      return;
    }

    navigate(firstAllowedPath(result.user), { replace: true });
  };

  return (
    <main className="auth-page auth-register-page">
      <div className="auth-overlay" />
      <AuthBrand />

      <section className="auth-stage auth-register-stage">
        <div className="auth-card auth-register-card">
          <div className="auth-card-head auth-register-head">
            <h1>Register User</h1>
            <p>Create credentials, choose an access type and mark allowed pages.</p>
          </div>

          <form className="auth-form auth-register-form" onSubmit={handleSubmit}>
            <div className="auth-credential-grid">
              <label className="auth-input-wrap" htmlFor="registerUsername">
                <span className="auth-input-icon"><UserIcon /></span>
                <input
                  id="registerUsername"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  autoComplete="username"
                  placeholder="Username"
                  required
                />
              </label>

              <label className="auth-input-wrap" htmlFor="registerPassword">
                <span className="auth-input-icon"><LockIcon /></span>
                <input
                  id="registerPassword"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="new-password"
                  placeholder="Password"
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

              <label className="auth-input-wrap" htmlFor="confirmPassword">
                <span className="auth-input-icon"><LockIcon /></span>
                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  autoComplete="new-password"
                  placeholder="Confirm Password"
                  required
                />
              </label>
            </div>

            <div className="auth-access-block">
              <span className="auth-section-label">Access Type</span>

              <div className="role-selector">
                <button
                  type="button"
                  className={`role-option ${accessType === "USER" ? "active" : ""}`}
                  onClick={() => selectRole("USER")}
                >
                  <span className="role-radio" />
                  <span>
                    <strong>USER</strong>
                    <small>Standard access</small>
                  </span>
                </button>

                <button
                  type="button"
                  className={`role-option ${accessType === "ADMIN" ? "active" : ""}`}
                  onClick={() => selectRole("ADMIN")}
                >
                  <span className="role-radio" />
                  <span>
                    <strong>ADMIN</strong>
                    <small>Full access by default</small>
                  </span>
                </button>
              </div>
            </div>

            <div className="auth-access-block">
              <div className="auth-section-row">
                <span className="auth-section-label">Page Access</span>
                <small>{permissions.length} selected</small>
              </div>

              <div className="permission-grid">
                {PAGE_OPTIONS.map((page) => {
                  const checked = permissions.includes(page.key);

                  return (
                    <label
                      className={`permission-card ${checked ? "checked" : ""}`}
                      key={page.key}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => togglePermission(page.key)}
                      />
                      <span className="permission-copy">
                        <strong>{page.label}</strong>
                        <small>{page.description}</small>
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {error && <div className="auth-error">{error}</div>}

            <button className="auth-primary-btn" type="submit">
              <span>Register Account</span>
              <span className="auth-btn-arrow">→</span>
            </button>
          </form>

          <div className="auth-register-prompt auth-register-back">
            <div className="auth-divider">
              <span />
              <small>Already have an account?</small>
              <span />
            </div>
            <Link className="auth-secondary-btn" to="/login">
              Back to Login
            </Link>
          </div>
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

export default Register;
