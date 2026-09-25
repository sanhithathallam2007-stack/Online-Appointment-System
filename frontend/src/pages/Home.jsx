import { Link } from 'react-router-dom'
import API_BASE_URL from '../api'

const steps = [
  { title: 'Login or Register', description: 'Create your account or sign in to access the system.' },
  { title: 'Choose a Category', description: 'Browse services by Hospitals, Schools, Government, Business, Public Representatives, or Entertainment.' },
  { title: 'Select a Professional', description: 'Find the right provider and review their profile and availability.' },
  { title: 'Choose an Available Slot', description: 'Pick a time that works for you from the available schedule.' },
  { title: 'Book Appointment', description: 'Confirm your appointment and manage it from My Appointments.' },
]

const features = [
  { icon: '⚡', title: 'Easy Booking', description: 'Book in a few clear steps with a simple and responsive interface.' },
  { icon: '🗓️', title: 'Available Time Slots', description: 'View only valid, current, and upcoming slots without expired times.' },
  { icon: '📋', title: 'Appointment Management', description: 'Track your booking status, upcoming visits, and past appointments.' },
  { icon: '🔄', title: 'Reschedule Appointments', description: 'Update your appointment when your schedule changes and a new slot is available.' },
  { icon: '🔐', title: 'Secure User Access', description: 'Protected user flows keep personal booking details safe.' },
  { icon: '👩‍⚕️', title: 'Provider Management', description: 'Coordinate provider schedules and appointment workflows from dedicated dashboards.' },
]

function Home() {
  return (
    <main className="home-page">
      <section className="hero-section">
        <div className="hero-content">
          <span className="eyebrow">Easy booking for every service</span>
          <h1>Book Appointments Easily</h1>
          <p>
            Find the right professional, choose an available time slot, and manage your appointments
            in one place.
          </p>

          <div className="hero-actions">
            <Link to="/categories" className="primary-btn">
              Browse Categories
            </Link>
            <Link to="/my-appointments" className="secondary-btn">
              My Appointments
            </Link>
          </div>
        </div>

        <div className="hero-card">
          <div className="mini-stat">
            <strong>6</strong>
            <span>Supported categories</span>
          </div>
          <div className="mini-stat">
            <strong>30+</strong>
            <span>Verified providers</span>
          </div>
          <div className="mini-stat">
            <strong>24/7</strong>
            <span>Online access</span>
          </div>
        </div>
      </section>

      <section className="info-section">
        <div className="section-heading">
          <span className="section-tag">How It Works</span>
          <h2>Book in a few simple steps</h2>
        </div>

        <div className="steps-grid">
          {steps.map((step, index) => (
            <div key={step.title} className="step-card">
              <div className="step-number">0{index + 1}</div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="info-section">
        <div className="section-heading">
          <span className="section-tag">Platform Features</span>
          <h2>Everything needed for appointment booking</h2>
        </div>

        <div className="services-grid">
          {features.map((feature) => (
            <div key={feature.title} className="service-card">
              <div className="service-icon" aria-hidden="true">
                {feature.icon}
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="info-section help-section">
        <div className="cta-box compact-help-box">
          <div>
            <span className="section-tag light-tag">Need Help?</span>
            <h2>Ask the AI assistant for quick appointment help.</h2>
          </div>
          <Link to="/categories" className="primary-btn">
            Explore Categories
          </Link>
        </div>
      </section>
    </main>
  )
}

export default Home
