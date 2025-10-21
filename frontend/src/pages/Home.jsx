import { Link } from 'react-router-dom'
import { getToken } from '../services/auth'
import '../assets/css/home.css'

function Home() {
  const isLoggedIn = getToken()

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">WasteVision</h1>
          <p className="hero-subtitle">Smart Waste Management with AI</p>
          <p className="hero-description">
            Revolutionize your waste disposal habits with our AI-powered waste classification system. 
            Upload images of waste items and get instant recommendations on proper disposal methods.
          </p>
          <div className="hero-buttons">
            {isLoggedIn ? (
              <Link to="/dashboard" className="btn btn-hero-primary">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-hero-primary">
                  Get Started
                </Link>
                <Link to="/login" className="btn btn-hero-secondary">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📸</div>
              <h3>Upload Image</h3>
              <p>Take a photo or upload an image of your waste item</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🤖</div>
              <h3>AI Classification</h3>
              <p>Our AI analyzes and classifies the waste type instantly</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">♻️</div>
              <h3>Get Recommendations</h3>
              <p>Receive proper disposal instructions and recycling tips</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits-section">
        <div className="container">
          <h2 className="section-title">Why Choose WasteVision?</h2>
          <div className="benefits-grid">
            <div className="benefit-item">
              <div className="benefit-icon">🌍</div>
              <h3>Environmental Impact</h3>
              <p>Help reduce landfill waste and promote recycling</p>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">📊</div>
              <h3>Track Your Progress</h3>
              <p>Monitor your waste classification history and statistics</p>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">💡</div>
              <h3>Learn Best Practices</h3>
              <p>Access tips and guidelines for sustainable waste management</p>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">⚡</div>
              <h3>Fast & Accurate</h3>
              <p>Get instant results with high accuracy AI classification</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2>Ready to Make a Difference?</h2>
          <p>Join thousands of users making smarter waste management decisions</p>
          {!isLoggedIn && (
            <Link to="/register" className="btn btn-cta">
              Start Now - It's Free
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="container">
          <p>&copy; 2025 WasteVision. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default Home