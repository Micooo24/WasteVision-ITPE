import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../assets/css/home.css';

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
            <Link to="/register" className="cta-button">
              Learn More
              <span className="arrow">→</span>
            </Link>
          </div>
          <div className="hero-image">
            <img 
              src="https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800" 
              alt="Recycling bins with plastic bottles" 
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stat-card">
          <h3 className="stat-number">22+</h3>
          <p className="stat-label">Years Experience</p>
        </div>
        <div className="stat-card">
          <h3 className="stat-number">9.2k</h3>
          <p className="stat-label">Happy Customers</p>
        </div>
        <div className="stat-card">
          <h3 className="stat-number">520</h3>
          <p className="stat-label">Projects Completed</p>
        </div>
        <div className="stat-card">
          <h3 className="stat-number">226</h3>
          <p className="stat-label">Expert Team</p>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section">
        <div className="about-content">
          <div className="about-text">
            <span className="section-tag">About Us</span>
            <h2 className="section-title">
              Work Together to Clean<br />
              The Ocean
            </h2>
            <p className="section-description">
              Lorem ipsum is simply dummy text of the printing and 
              typesetting industry. Lorem Ipsum has been the 
              industry's standard dummy text ever since the 1500s.
            </p>
            <Link to="/about" className="cta-button">
              Learn More
              <span className="arrow">→</span>
            </Link>
          </div>
          <div className="about-image">
            <img 
              src="https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=600" 
              alt="Waste collection worker" 
            />
            <div className="stat-badge">
              <h3>22+</h3>
              <p>Years Experience</p>
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
              src="https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400" 
              alt="Waste Management" 
            />
            <h3>Waste Management</h3>
            <p>Efficient waste collection and disposal solutions for a cleaner environment.</p>
          </div>
          <div className="service-card">
            <img 
              src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400" 
              alt="Recycle Service" 
            />
            <h3>Recycle Service</h3>
            <p>Transform waste into valuable resources through our recycling programs.</p>
          </div>
          <div className="service-card">
            <img 
              src="https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=400" 
              alt="Community Campaign" 
            />
            <h3>Community Campaign</h3>
            <p>Join our initiatives to raise awareness and promote sustainable practices.</p>
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
            <h2>FAQ</h2>
            <h3>We cannot waste or lose time!</h3>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          </div>
          <div className="cta-text">
            <h3>Are you a nature lover?</h3>
            <Link to="/register" className="btn-light">Join Now</Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;