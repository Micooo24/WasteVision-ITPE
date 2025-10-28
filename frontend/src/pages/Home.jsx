import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../assets/css/home.css';
import hero from '../assets/img/group-multi-colored-trash-cans-are-sidewalk_921860-178361.jpg';
import about from '../assets/img/robotic-waste-optimization-ai-powered-circular-economy-analytics-efficient-sustainability_1223049-701.jpg';

const Home = ({ isAuthenticated, setIsAuthenticated }) => {
  return (
    <div className="home-container">
      <Navbar isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated}/>
      
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Smart Solutions for<br />
              Sustainable <span className="highlight">Living</span>
            </h1>
            <p className="hero-description">
              Innovative powers in sustainability for a dynamic, 
              boundless future, together on the journey towards 
              a greener, more harmonious tomorrow.
            </p>
            <Link to="/about" className="cta-button">
              Learn More
              <span className="arrow">→</span>
            </Link>
          </div>
          <div className="hero-image">
            <img 
              src={hero} 
              alt="Recycling bins with plastic bottles" 
            />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section">
        <div className="about-content">
          <div className="about-text">
            <span className="section-tag">About Us</span>
            <h2 className="section-title">
              AI-Powered Waste<br />
              Classification for a <span className="highlight">Greener</span> Future
            </h2>
            <p className="section-description">
              WasteVision revolutionizes waste management through cutting-edge 
              artificial intelligence. Our advanced computer vision technology 
              accurately identifies and classifies different types of waste, 
              helping individuals and communities make informed recycling decisions 
              for a more sustainable planet.
            </p>
            <Link to="/about" className="cta-button">
              Learn More
              <span className="arrow">→</span>
            </Link>
          </div>
          <div className="about-image">
            <img 
              src={about}
              alt="AI technology analyzing waste materials" 
            />
            <div className="stat-badge">
              <h3>95%+</h3>
              <p>Classification Accuracy</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="services-section">
        <div className="services-header">
          <span className="section-tag">Our Services</span>
          <h2 className="section-title">Services We Offer</h2>
        </div>
        <div className="services-grid">
          <div className="service-card">
            <img 
              src="https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400" 
              alt="AI Waste Classification" 
            />
            <h3>AI Waste Classification</h3>
            <p>Upload an image and get instant AI-powered identification of waste types with 95%+ accuracy using advanced computer vision technology.</p>
          </div>
          <div className="service-card">
            <img 
              src="https://images.unsplash.com/photo-1586973725142-1a4b6b8f2de0?w=400" 
              alt="Smart Disposal Guidance" 
            />
            <h3>Smart Disposal Guidance</h3>
            <p>Receive personalized recycling instructions and disposal methods based on your waste items to ensure proper environmental handling.</p>
          </div>
          <div className="service-card">
            <img 
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400" 
              alt="Classification History Analytics" 
            />
            <h3>Classification History & Analytics</h3>
            <p>Track your environmental impact with detailed classification history and analytics to monitor your sustainable living progress.</p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mission-section">
        <div className="mission-content">
          <div className="mission-image">
            <img 
              src="https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=600" 
              alt="Volunteers" 
            />
          </div>
          <div className="mission-text">
            <span className="section-tag">Our Mission</span>
            <h2 className="section-title">
              Efficient Solutions for a<br />
              Greener Tomorrow
            </h2>
            <p className="section-description">
              We are committed to providing innovative waste management 
              solutions that help create a sustainable future for 
              generations to come.
            </p>
            <div className="mission-buttons">
              <Link to="/register" className="btn-primary">Join Us</Link>
              <Link to="/tips" className="btn-secondary">Get Tips</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <span className="section-tag">Our Client</span>
        <h2 className="section-title">What we Client Have to Say</h2>
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <div className="testimonial-header">
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" 
                alt="Client" 
              />
              <div>
                <h4>John Doe</h4>
                <div className="stars">★★★★★</div>
              </div>
            </div>
            <p>
              "Excellent service! The waste management system has made 
              recycling so much easier for our community."
            </p>
          </div>
          <div className="testimonial-card">
            <div className="testimonial-header">
              <img 
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100" 
                alt="Client" 
              />
              <div>
                <h4>Jane Smith</h4>
                <div className="stars">★★★★★</div>
              </div>
            </div>
            <p>
              "Great initiative! The AI-powered classification helps us 
              properly dispose of waste and contribute to a cleaner environment."
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <div className="cta-text">
            <h2>Ready to Get Started?</h2>
            <h3>Transform Your Waste Management Today!</h3>
            <p>Join thousands of users making a positive environmental impact with AI-powered waste classification.</p>
          </div>
          <div className="cta-text">
            <h3>Start Classifying Your Waste</h3>
            <Link to="/register" className="btn-light">Get Started Now</Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;