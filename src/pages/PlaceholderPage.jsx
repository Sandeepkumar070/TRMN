import "./PlaceholderPage.css";

function PlaceholderPage({ eyebrow = "Module", title, description }) {
  return (
    <section className="placeholder-page">
      <div className="placeholder-heading">
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <div className="placeholder-card">
        <div className="placeholder-symbol">⌁</div>
        <h3>{title}</h3>
        <p>This module is ready for the next development step.</p>
      </div>
    </section>
  );
}

export default PlaceholderPage;
