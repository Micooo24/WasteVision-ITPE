import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../assets/css/about.css';
import hero from '../assets/img/group-multi-colored-trash-cans-are-sidewalk_921860-178361.jpg';
import img1 from '../assets/img/img1.jpg'
import alt from '../assets/img/OIP.jpg'

const About = ({ isAuthenticated, setIsAuthenticated }) => {
  return (
    <div className="about-container">
      <Navbar isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
      
      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero-content">
          <h1>About WasteVision</h1>
          <p>Pioneering Smart Waste Management Through AI Innovation</p>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="mission-vision-section">
        <div className="mission-vision-container">
          <div className="mission-box">
            <div className="icon-wrapper mission-icon">
              <i className="fas fa-bullseye"></i>
            </div>
            <h2>Our Mission</h2>
            <p>
              To revolutionize waste management through artificial intelligence, 
              making sustainable living accessible and effortless for everyone. 
              We strive to reduce environmental impact by empowering communities 
              with smart waste segregation technology.
            </p>
          </div>
          
          <div className="mission-box">
            <div className="icon-wrapper vision-icon">
              <i className="fas fa-eye"></i>
            </div>
            <h2>Our Vision</h2>
            <p>
              A world where waste is no longer wasted. We envision a sustainable 
              future where every piece of waste is properly classified, recycled, 
              and repurposed, contributing to a cleaner, greener planet for 
              generations to come.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="story-section">
        <div className="story-content">
          <div className="story-text">
            <span className="section-tag">Our Story</span>
            <h2>The Journey to Sustainable Innovation</h2>
            <p>
              WasteVision was born from a simple observation: the world generates 
              over 2 billion tons of waste annually, and improper waste segregation 
              remains a critical challenge in achieving sustainability goals.
            </p>
            <p>
              Founded in 2023, our team of environmental enthusiasts and AI experts 
              came together with a shared vision—to harness the power of artificial 
              intelligence to solve one of humanity's most pressing environmental 
              challenges. What started as a research project has evolved into a 
              comprehensive platform that's making a real difference.
            </p>
            <p>
              Today, WasteVision serves thousands of users, helping them make 
              informed decisions about waste disposal while contributing to 
              environmental data collection and analysis. Our AI-powered system 
              has classified over 100,000 waste items, diverting thousands of 
              pounds from landfills to proper recycling facilities.
            </p>
          </div>
          <div className="story-image">
            <img 
              src={hero}
              alt="Team working on sustainability" 
            />
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section">
        <span className="section-tag">Our Values</span>
        <h2>What We Stand For</h2>
        <div className="values-grid">
          <div className="value-card">
            <div className="value-icon">
              <i className="fas fa-leaf"></i>
            </div>
            <h3>Sustainability</h3>
            <p>
              We're committed to creating solutions that promote long-term 
              environmental health and sustainable practices.
            </p>
          </div>
          
          <div className="value-card">
            <div className="value-icon">
              <i className="fas fa-lightbulb"></i>
            </div>
            <h3>Innovation</h3>
            <p>
              We leverage cutting-edge AI technology to continuously improve 
              waste classification accuracy and user experience.
            </p>
          </div>
          
          <div className="value-card">
            <div className="value-icon">
              <i className="fas fa-users"></i>
            </div>
            <h3>Community</h3>
            <p>
              We believe in the power of collective action and building a 
              community of environmentally conscious individuals.
            </p>
          </div>
          
          <div className="value-card">
            <div className="value-icon">
              <i className="fas fa-chart-line"></i>
            </div>
            <h3>Transparency</h3>
            <p>
              We provide clear insights and data-driven recommendations to 
              help users understand their environmental impact.
            </p>
          </div>
          
          <div className="value-card">
            <div className="value-icon">
              <i className="fas fa-hands-helping"></i>
            </div>
            <h3>Accessibility</h3>
            <p>
              We make sustainable waste management simple and accessible to 
              everyone, regardless of technical expertise.
            </p>
          </div>
          
          <div className="value-card">
            <div className="value-icon">
              <i className="fas fa-shield-alt"></i>
            </div>
            <h3>Integrity</h3>
            <p>
              We operate with honesty and accountability, ensuring our 
              recommendations are based on accurate data and research.
            </p>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="technology-section">
        <div className="technology-content">
          <div className="technology-image">
            <img 
              src={img1}
              alt="AI Technology" 
            />
          </div>
          <div className="technology-text">
            <span className="section-tag">Our Technology</span>
            <h2>AI-Powered Waste Classification</h2>
            <p>
              At the heart of WasteVision is our advanced YOLOv5-based deep 
              learning model, trained on thousands of waste images to accurately 
              identify and classify different types of waste materials.
            </p>
            <div className="tech-features">
              <div className="tech-feature">
                <i className="fas fa-check-circle"></i>
                <span>95%+ Classification Accuracy</span>
              </div>
              <div className="tech-feature">
                <i className="fas fa-check-circle"></i>
                <span>Real-time Image Processing</span>
              </div>
              <div className="tech-feature">
                <i className="fas fa-check-circle"></i>
                <span>Continuous Model Improvement</span>
              </div>
              <div className="tech-feature">
                <i className="fas fa-check-circle"></i>
                <span>Multi-category Detection</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="impact-section">
        <span className="section-tag">Our Impact</span>
        <h2>Making a Difference Together</h2>
        <div className="impact-stats">
          <div className="impact-stat">
            <h3>100K+</h3>
            <p>Items Classified</p>
          </div>
          <div className="impact-stat">
            <h3>5K+</h3>
            <p>Active Users</p>
          </div>
          <div className="impact-stat">
            <h3>50K+</h3>
            <p>Tons Recycled</p>
          </div>
          <div className="impact-stat">
            <h3>30%</h3>
            <p>Waste Reduction</p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <span className="section-tag">Our Team</span>
        <h2>Meet the People Behind WasteVision</h2>
        <div className="team-grid">
          <div className="team-card">
            <div className="team-image">
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300" 
                alt={alt}
              />
            </div>
            <h3>bridget andersen</h3>
            <p className="team-role">CEO & Co-Founder</p>
            <p className="team-bio">Environmental scientist with 15+ years of experience</p>
          </div>
          
          <div className="team-card">
            <div className="team-image">
              <img 
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300" 
                alt={alt}
              />
            </div>
            <h3>student 1</h3>
            <p className="team-role">CTO & Co-Founder</p>
            <p className="team-bio">AI researcher specializing in computer vision</p>
          </div>
          
          <div className="team-card">
            <div className="team-image">
              <img 
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300" 
                alt={alt}
              />
            </div>
            <h3>student 2</h3>
            <p className="team-role">Head of Engineering</p>
            <p className="team-bio">Full-stack developer passionate about sustainability</p>
          </div>
          
          <div className="team-card">
            <div className="team-image">
              <img 
                src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=300" 
                alt={alt}
              />
            </div>
            <h3>student 3</h3>
            <p className="team-role">Head of Operations</p>
            <p className="team-bio">Operations expert with sustainability focus</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta-section">
        <div className="about-cta-content">
          <h2>Ready to Make a Difference?</h2>
          <p>Join thousands of users who are contributing to a cleaner, greener planet</p>
          <div className="about-cta-buttons">
            <Link to="/register" className="btn-primary">Get Started</Link>
            <Link to="/tips" className="btn-secondary">Learn More</Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;