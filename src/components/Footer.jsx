import "./Footer.css";

function Footer() {
  return (
    <footer className="app-footer">
      <span>© {new Date().getFullYear()} Pitech Automation & Software Solutions Pvt. Ltd.</span>
      <span className="footer-center">Tag Management System</span>
      <span>Version 1.0.0</span>
    </footer>
  );
}

export default Footer;
