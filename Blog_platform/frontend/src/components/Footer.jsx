export default function Footer() {
  return (
    <footer className="footer" id="footer">
      <p>
        © {new Date().getFullYear()} <span className="footer-brand">Inkwell</span>. Crafted with passion.
      </p>
    </footer>
  );
}
