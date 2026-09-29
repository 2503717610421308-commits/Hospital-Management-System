import { Link } from 'react-router-dom';

export default function LandingPage() {
  const features = [
    { icon: 'calendar-check', title: 'Appointment Management', desc: 'Book, reschedule, and manage appointments with ease', color: '#4dabf7' },
    { icon: 'file-earmark-medical', title: 'Medical Records', desc: 'Secure digital health records accessible anytime', color: '#51cf66' },
    { icon: 'prescription2', title: 'Prescriptions', desc: 'Digital prescriptions with refill tracking', color: '#ff6b6b' },
    { icon: 'receipt', title: 'Billing & Payments', desc: 'Transparent billing with online payment options', color: '#ffd43b' },
    { icon: 'people-fill', title: 'Multi-Role Access', desc: 'Dedicated dashboards for doctors, nurses, staff', color: '#cc5de8' },
    { icon: 'shield-check', title: 'Secure & Reliable', desc: 'Enterprise-grade security for your health data', color: '#20c997' }
  ];

  const departments = ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Dermatology', 'General Medicine', 'ENT', 'Ophthalmology'];

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark position-fixed w-100" style={{ zIndex: 1050, background: 'rgba(26,28,46,0.95)', backdropFilter: 'blur(10px)' }}>
        <div className="container">
          <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
            <i className="bi bi-hospital fs-4 text-info"></i>
            <span className="fw-bold">HMS</span>
          </Link>
          <button className="navbar-toggler" data-bs-toggle="collapse" data-bs-target="#navContent"><span className="navbar-toggler-icon"></span></button>
          <div className="collapse navbar-collapse" id="navContent">
            <ul className="navbar-nav mx-auto">
              <li className="nav-item"><a className="nav-link" href="#about">About</a></li>
              <li className="nav-item"><a className="nav-link" href="#services">Services</a></li>
              <li className="nav-item"><a className="nav-link" href="#departments">Departments</a></li>
              <li className="nav-item"><a className="nav-link" href="#features">Features</a></li>
              <li className="nav-item"><a className="nav-link" href="#contact">Contact</a></li>
            </ul>
            <div className="d-flex gap-2">
              <Link to="/login" className="btn btn-outline-light btn-sm px-3">Login</Link>
              <Link to="/register" className="btn btn-info btn-sm px-3">Register</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero-section text-center">
        <div className="container position-relative" style={{ zIndex: 2 }}>
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <span className="badge bg-white bg-opacity-25 text-white px-3 py-2 mb-3 rounded-pill">
                <i className="bi bi-stars me-1"></i> Smart Healthcare Management
              </span>
              <h1 className="display-3 fw-bold mb-4" style={{ lineHeight: 1.15 }}>Hospital Management<br/>System</h1>
              <p className="lead mb-4 opacity-75" style={{ fontSize: '1.15rem' }}>
                A comprehensive digital solution for managing hospital operations — from patient registration
                to billing. Streamlined workflows for doctors, nurses, receptionists, and administrators.
              </p>
              <div className="d-flex justify-content-center gap-3 flex-wrap">
                <Link to="/register" className="btn btn-light btn-lg px-4 fw-semibold"><i className="bi bi-person-plus me-2"></i>Register Now</Link>
                <Link to="/login" className="btn btn-outline-light btn-lg px-4"><i className="bi bi-box-arrow-in-right me-2"></i>Login</Link>
              </div>
              <div className="row mt-5 pt-4 text-start justify-content-center">
                <div className="col-auto text-center px-4">
                  <h3 className="fw-bold mb-0">500+</h3><small className="opacity-75">Patients Served</small>
                </div>
                <div className="col-auto text-center px-4 border-start border-end border-white border-opacity-25">
                  <h3 className="fw-bold mb-0">50+</h3><small className="opacity-75">Expert Doctors</small>
                </div>
                <div className="col-auto text-center px-4">
                  <h3 className="fw-bold mb-0">8</h3><small className="opacity-75">Departments</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-5" style={{ background: '#fff' }}>
        <div className="container py-4">
          <div className="row align-items-center">
            <div className="col-lg-6 mb-4 mb-lg-0">
              <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 mb-3">About the System</span>
              <h2 className="fw-bold mb-3">Comprehensive Hospital Management</h2>
              <p className="text-muted mb-4">Our Hospital Management System digitizes and streamlines all hospital operations. From patient registration to discharge, every step is managed efficiently through a unified platform.</p>
              <div className="row g-3">
                {['Patient Registration', 'Appointment Scheduling', 'Medical Records', 'Billing & Payments'].map((item, i) => (
                  <div key={i} className="col-6"><div className="d-flex align-items-center gap-2"><i className="bi bi-check-circle-fill text-success"></i><span>{item}</span></div></div>
                ))}
              </div>
            </div>
            <div className="col-lg-6">
              <div className="p-4 rounded-4" style={{ background: 'linear-gradient(135deg, #667eea20, #764ba220)' }}>
                <div className="row g-3">
                  {[{ n: 'Admin', c: 'primary' }, { n: 'Doctor', c: 'success' }, { n: 'Receptionist', c: 'warning' }, { n: 'Patient', c: 'info' }].map((r, i) => (
                    <div key={i} className="col-6">
                      <div className={`bg-white rounded-3 p-3 text-center shadow-sm`}>
                        <i className={`bi bi-person-circle fs-3 text-${r.c} d-block mb-1`}></i>
                        <span className="fw-semibold">{r.n} Portal</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-5" style={{ background: '#f8f9fa' }}>
        <div className="container py-4 text-center">
          <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 mb-3">Our Services</span>
          <h2 className="fw-bold mb-5">Healthcare Services We Offer</h2>
          <div className="row g-4">
            {['General Consultation', 'Emergency Care', 'Lab & Diagnostics', 'Pharmacy', 'Surgery', 'Follow-up Care'].map((s, i) => (
              <div key={i} className="col-md-4 col-sm-6">
                <div className="bg-white rounded-3 p-4 shadow-sm h-100">
                  <i className={`bi bi-${['chat-dots', 'lightning', 'droplet', 'capsule', 'bandaid', 'arrow-repeat'][i]} fs-2 text-primary d-block mb-2`}></i>
                  <h6 className="fw-semibold">{s}</h6>
                  <p className="text-muted small mb-0">Providing quality healthcare services with modern technology and expert professionals.</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Departments */}
      <section id="departments" className="py-5" style={{ background: '#fff' }}>
        <div className="container py-4 text-center">
          <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 mb-3">Departments</span>
          <h2 className="fw-bold mb-5">Specialized Departments</h2>
          <div className="row g-3 justify-content-center">
            {departments.map((d, i) => (
              <div key={i} className="col-lg-3 col-md-4 col-sm-6">
                <div className="border rounded-3 p-3 h-100 d-flex align-items-center gap-2">
                  <i className="bi bi-building text-primary"></i><span className="fw-medium">{d}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-5" style={{ background: '#f8f9fa' }}>
        <div className="container py-4 text-center">
          <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 mb-3">Features</span>
          <h2 className="fw-bold mb-5">Why Choose Our System</h2>
          <div className="row g-4">
            {features.map((f, i) => (
              <div key={i} className="col-lg-4 col-md-6">
                <div className="feature-card h-100">
                  <div className="feature-icon" style={{ background: f.color + '20', color: f.color }}><i className={`bi bi-${f.icon}`}></i></div>
                  <h5 className="fw-semibold">{f.title}</h5>
                  <p className="text-muted small mb-0">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-5" style={{ background: '#1a1c2e', color: '#fff' }}>
        <div className="container py-4 text-center">
          <h2 className="fw-bold mb-3">Contact Us</h2>
          <p className="text-white-50 mb-4">Have questions? Reach out to us anytime.</p>
          <div className="row g-4 justify-content-center">
            {[
              { icon: 'geo-alt', text: '100 Medical Center Drive, Mumbai' },
              { icon: 'telephone', text: '+91 22 1234 5678' },
              { icon: 'envelope', text: 'info@citygeneralhospital.com' }
            ].map((c, i) => (
              <div key={i} className="col-md-4">
                <i className={`bi bi-${c.icon} fs-3 text-info d-block mb-2`}></i>
                <span>{c.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-3 text-center" style={{ background: '#141625', color: '#718096' }}>
        <small>© 2026 Hospital Management System. Built with MERN Stack.</small>
      </footer>
    </div>
  );
}
