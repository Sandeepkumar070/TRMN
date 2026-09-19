import { useTheme } from "../context/ThemeContext";
import { PAGE_OPTIONS, useAuth } from "../context/AuthContext";
import "./Settings.css";

function Settings() {
  const { mode, toggleMode, themeId, setThemeId, themeOptions } = useTheme();
  const { currentUser } = useAuth();

  const allowedPages = PAGE_OPTIONS.filter((page) => currentUser?.permissions?.includes(page.key));

  return (
    <section className="settings-page">
      <div className="settings-heading">
        <span className="settings-eyebrow">Administration</span>
        <h1>Settings</h1>
        <p>Change the application appearance and review your account access.</p>
      </div>

      <div className="settings-grid">
        <article className="settings-card settings-appearance-card">
          <div className="settings-card-header">
            <div className="settings-icon">◐</div>
            <div>
              <h2>Appearance</h2>
              <p>Theme controls are available only on this Settings page.</p>
            </div>
          </div>

          <div className="settings-mode-row">
            <div>
              <strong>Display Mode</strong>
              <span>Current mode: {mode === "dark" ? "Dark" : "Light"}</span>
            </div>
            <button className="settings-mode-toggle" type="button" onClick={toggleMode}>
              <span className={`settings-toggle-track ${mode === "dark" ? "on" : ""}`}>
                <span className="settings-toggle-thumb">{mode === "dark" ? "☾" : "☀"}</span>
              </span>
              {mode === "dark" ? "Switch to Light" : "Switch to Dark"}
            </button>
          </div>

          <div className="settings-theme-area">
            <div className="settings-section-title">
              <strong>Theme Color</strong>
              <span>Select a system accent color.</span>
            </div>

            <select className="settings-theme-select" value={themeId} onChange={(e) => setThemeId(e.target.value)}>
              {themeOptions.map((theme) => (
                <option key={theme.id} value={theme.id}>{theme.name}</option>
              ))}
            </select>

            <div className="settings-swatches">
              {themeOptions.map((theme) => (
                <button
                  type="button"
                  key={theme.id}
                  className={`settings-swatch ${themeId === theme.id ? "selected" : ""}`}
                  style={{ backgroundColor: theme.primary }}
                  title={theme.name}
                  aria-label={theme.name}
                  onClick={() => setThemeId(theme.id)}
                />
              ))}
            </div>
          </div>
        </article>

        <article className="settings-card">
          <div className="settings-card-header">
            <div className="settings-icon">♙</div>
            <div>
              <h2>Account Access</h2>
              <p>Your registered role and allowed pages.</p>
            </div>
          </div>

          <div className="settings-account-row">
            <span>Username</span>
            <strong>{currentUser?.username}</strong>
          </div>
          <div className="settings-account-row">
            <span>Access Type</span>
            <strong className="settings-role-badge">{currentUser?.accessType}</strong>
          </div>

          <div className="settings-access-list">
            <span className="settings-section-title"><strong>Allowed Pages</strong></span>
            {allowedPages.map((page) => (
              <div className="settings-access-item" key={page.key}>
                <span className="settings-check">✓</span>
                <div>
                  <strong>{page.label}</strong>
                  <span>{page.description}</span>
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}

export default Settings;
