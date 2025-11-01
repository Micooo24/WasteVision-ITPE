import React from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import '../assets/css/tips.css'

function Tips({ isAuthenticated, setIsAuthenticated }) {
  const tips = [
    {
      icon: 'fas fa-recycle',
      title: 'Separate Your Waste',
      category: 'Recycling',
      description: 'Sort your waste into different categories: recyclables, organic waste, and general waste. This makes the recycling process more efficient and effective.',
      color: '#10b981'
    },
    {
      icon: 'fas fa-leaf',
      title: 'Compost Organic Waste',
      category: 'Composting',
      description: 'Turn your food scraps and yard waste into nutrient-rich compost. This reduces landfill waste and creates natural fertilizer for your garden.',
      color: '#0f4c3a'
    },
    {
      icon: 'fas fa-shopping-bag',
      title: 'Use Reusable Bags',
      category: 'Reduce',
      description: 'Replace single-use plastic bags with reusable shopping bags. Keep them in your car or by the door so you never forget them.',
      color: '#ff6b35'
    },
    {
      icon: 'fas fa-bottle-water',
      title: 'Avoid Single-Use Plastics',
      category: 'Reduce',
      description: 'Choose reusable water bottles, coffee cups, and food containers instead of disposable ones. This significantly reduces plastic waste.',
      color: '#3b82f6'
    },
    {
      icon: 'fas fa-lightbulb',
      title: 'Proper Disposal of Electronics',
      category: 'E-Waste',
      description: 'Never throw electronics in regular trash. Take them to designated e-waste recycling centers where they can be properly processed.',
      color: '#8b5cf6'
    },
    {
      icon: 'fas fa-paint-brush',
      title: 'Handle Hazardous Waste Carefully',
      category: 'Hazardous',
      description: 'Batteries, paint, chemicals, and light bulbs require special disposal. Contact your local waste management facility for proper disposal methods.',
      color: '#ef4444'
    },
    {
      icon: 'fas fa-box',
      title: 'Flatten Cardboard Boxes',
      category: 'Recycling',
      description: 'Break down cardboard boxes before recycling to save space in your recycling bin and make collection more efficient.',
      color: '#f59e0b'
    },
    {
      icon: 'fas fa-jar',
      title: 'Clean Containers Before Recycling',
      category: 'Recycling',
      description: 'Rinse out food containers, jars, and cans before placing them in the recycling bin to prevent contamination.',
      color: '#06b6d4'
    },
    {
      icon: 'fas fa-gift',
      title: 'Donate Unwanted Items',
      category: 'Reuse',
      description: 'Give clothes, furniture, and household items a second life by donating them to charity instead of throwing them away.',
      color: '#ec4899'
    },
    {
      icon: 'fas fa-spray-can',
      title: 'Buy Products with Less Packaging',
      category: 'Reduce',
      description: 'Choose products with minimal or recyclable packaging. Support brands that use sustainable packaging materials.',
      color: '#14b8a6'
    },
    {
      icon: 'fas fa-utensils',
      title: 'Plan Meals to Reduce Food Waste',
      category: 'Reduce',
      description: 'Plan your meals and shop with a list to avoid buying excess food that might go to waste. Store food properly to extend its life.',
      color: '#84cc16'
    },
    {
      icon: 'fas fa-hands-helping',
      title: 'Educate Others',
      category: 'Community',
      description: 'Share your knowledge about proper waste management with family, friends, and neighbors to create a bigger positive impact.',
      color: '#6366f1'
    }
  ]

  return (
    <div className="tips-container">
      <Navbar isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
      
      {/* Hero Section */}
      <section className="tips-hero">
        <div className="tips-hero-content">
          <h1>Waste Management Tips</h1>
          <p>Practical advice for reducing waste and living sustainably</p>
        </div>
      </section>

      {/* Tips Introduction */}
      <section className="tips-intro-section">
        <div className="tips-intro-content">
          <span className="section-tag">Why It Matters</span>
          <h2 className="section-title">Small Changes, Big Impact</h2>
          <p className="section-description">
            Every action counts when it comes to waste management. By following these simple tips, 
            you can significantly reduce your environmental footprint and contribute to a cleaner, 
            healthier planet for future generations.
          </p>
        </div>
      </section>

      {/* Tips Grid Section */}
      <section className="tips-grid-section">
        <div className="tips-grid">
          {tips.map((tip, index) => (
            <div key={index} className="tip-card" style={{ '--accent-color': tip.color }}>
              <div className="tip-icon" style={{ backgroundColor: `${tip.color}15`, color: tip.color }}>
                <i className={tip.icon}></i>
              </div>
              <span className="tip-category" style={{ backgroundColor: `${tip.color}15`, color: tip.color }}>
                {tip.category}
              </span>
              <h3>{tip.title}</h3>
              <p>{tip.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="tips-cta-section">
        <div className="tips-cta-content">
          <h2>Start Making a Difference Today</h2>
          <p>Use our AI-powered tool to classify your waste and get personalized recommendations</p>
          <div className="tips-cta-buttons">
            {isAuthenticated ? (
              <>
                <a href="/dashboard" className="btn-primary">Try Now</a>
                <a href="/about" className="btn-secondary">Learn More</a>
              </>
            ) : (
              <>
                <a href="/register" className="btn-primary">Get Started</a>
                <a href="/about" className="btn-secondary">Learn More</a>
              </>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Tips