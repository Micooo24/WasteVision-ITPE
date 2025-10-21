import '../assets/css/components.css'

function Footer({ className = '' }) {
  return (
    <footer className={`footer ${className}`}>
      <div className="footer-container">
        <p>&copy; {new Date().getFullYear()} WasteVision. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default Footer