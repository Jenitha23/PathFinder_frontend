import React, { useState, useEffect } from 'react';

function App() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Styles
  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: 'white',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    navbar: {
      position: 'fixed',
      top: 0,
      width: '100%',
      zIndex: 50,
      transition: 'all 0.3s ease',
      backgroundColor: scrolled ? 'rgba(255, 255, 255, 0.9)' : 'transparent',
      backdropFilter: scrolled ? 'blur(10px)' : 'none',
      boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,0.1)' : 'none',
    },
    navContainer: {
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '0 2rem',
      height: '80px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    logo: {
      fontFamily: '"Playfair Display", serif',
      fontSize: '2rem',
      fontWeight: 700,
      background: 'linear-gradient(135deg, #f48fb1, #f06292)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      cursor: 'pointer',
    },
    navMenu: {
      display: 'flex',
      gap: '2.5rem',
      alignItems: 'center',
    },
    navLink: {
      color: '#4a5568',
      textDecoration: 'none',
      fontWeight: 500,
      transition: 'color 0.3s ease',
      position: 'relative',
      cursor: 'pointer',
    },
    navLinkHover: {
      color: '#f48fb1',
    },
    buttonOutline: {
      padding: '0.6rem 1.5rem',
      background: 'transparent',
      border: '2px solid #f48fb1',
      borderRadius: '8px',
      color: '#f48fb1',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
    },
    buttonGradient: {
      padding: '0.6rem 1.5rem',
      background: 'linear-gradient(135deg, #f48fb1, #f06292)',
      border: 'none',
      borderRadius: '8px',
      color: 'white',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
    },
    heroSection: {
      background: 'linear-gradient(135deg, #fce4ec 0%, #f8bbd0 50%, #f48fb1 100%)',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      padding: '0 2rem',
      position: 'relative',
      overflow: 'hidden',
    },
    heroContainer: {
      maxWidth: '1280px',
      margin: '0 auto',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '4rem',
      alignItems: 'center',
      width: '100%',
    },
    heroTitle: {
      fontFamily: '"Playfair Display", serif',
      fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
      lineHeight: 1.2,
      marginBottom: '1.5rem',
      color: '#2d3748',
    },
    heroGradient: {
      background: 'linear-gradient(135deg, #c2185b, #ad1457)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      display: 'inline-block',
    },
    heroSubtitle: {
      fontSize: '1.25rem',
      color: '#4a5568',
      marginBottom: '2rem',
      maxWidth: '500px',
    },
    buttonGroup: {
      display: 'flex',
      gap: '1.5rem',
      flexWrap: 'wrap',
    },
    buttonPrimary: {
      padding: '1rem 2.5rem',
      background: 'linear-gradient(135deg, #f48fb1, #f06292)',
      border: 'none',
      borderRadius: '12px',
      color: 'white',
      fontWeight: 600,
      fontSize: '1.1rem',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 5px 15px rgba(240, 98, 146, 0.3)',
    },
    buttonSecondary: {
      padding: '1rem 2.5rem',
      background: 'transparent',
      border: '2px solid #f48fb1',
      borderRadius: '12px',
      color: '#f48fb1',
      fontWeight: 600,
      fontSize: '1.1rem',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
    },
    illustrationContainer: {
      position: 'relative',
      height: '500px',
      animation: 'float 6s ease-in-out infinite',
    },
    illustrationGrid: {
      position: 'relative',
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '1rem',
      padding: '2rem',
      background: 'rgba(255, 255, 255, 0.3)',
      backdropFilter: 'blur(10px)',
      borderRadius: '24px',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
    },
    illustrationCard: {
      background: 'rgba(255, 255, 255, 0.9)',
      padding: '1.5rem',
      borderRadius: '16px',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.3s ease',
    },
    featuresSection: {
      padding: '6rem 2rem',
      background: 'white',
    },
    sectionContainer: {
      maxWidth: '1280px',
      margin: '0 auto',
    },
    sectionTitle: {
      fontFamily: '"Playfair Display", serif',
      fontSize: 'clamp(2rem, 4vw, 3rem)',
      textAlign: 'center',
      color: '#2d3748',
      marginBottom: '4rem',
      position: 'relative',
    },
    sectionTitleAfter: {
      content: '""',
      display: 'block',
      width: '100px',
      height: '4px',
      background: 'linear-gradient(135deg, #f48fb1, #f06292)',
      margin: '1rem auto',
      borderRadius: '2px',
    },
    featuresGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '2rem',
    },
    featureCard: {
      background: 'white',
      padding: '2.5rem',
      borderRadius: '20px',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
      border: '1px solid #fce4ec',
      transition: 'all 0.3s ease',
      position: 'relative',
      overflow: 'hidden',
    },
    featureIcon: {
      width: '80px',
      height: '80px',
      background: 'linear-gradient(135deg, #fce4ec, #f8bbd0)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '1.5rem',
      transition: 'all 0.3s ease',
    },
    featureTitle: {
      fontFamily: '"Playfair Display", serif',
      fontSize: '1.5rem',
      marginBottom: '1rem',
      color: '#2d3748',
    },
    featureDescription: {
      color: '#718096',
      lineHeight: 1.7,
    },
    statsSection: {
      padding: '5rem 2rem',
      background: 'linear-gradient(135deg, #f48fb1, #f06292)',
      color: 'white',
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '2rem',
      maxWidth: '1280px',
      margin: '0 auto',
    },
    statItem: {
      textAlign: 'center',
    },
    statNumber: {
      fontSize: '3.5rem',
      fontWeight: 700,
      marginBottom: '0.5rem',
      fontFamily: '"Playfair Display", serif',
    },
    statLabel: {
      fontSize: '1.2rem',
      opacity: 0.9,
      fontWeight: 500,
    },
    footer: {
      background: 'white',
      padding: '2rem',
      borderTop: '2px solid #fce4ec',
      textAlign: 'center',
      color: '#718096',
    },
  };

  // Add keyframes animation
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800&family=Inter:wght=300;400;500;600;700&display=swap');
      
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: 'Inter', sans-serif;
        overflow-x: hidden;
      }
      
      h1, h2, h3, h4, h5, h6 {
        font-family: 'Playfair Display', serif;
      }
      
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      @keyframes float {
        0%, 100% {
          transform: translateY(0);
        }
        50% {
          transform: translateY(-20px);
        }
      }
      
      .animate-fade-in {
        animation: fadeIn 1s ease-out forwards;
      }
      
      .animate-float {
        animation: float 6s ease-in-out infinite;
      }
      
      @media (max-width: 768px) {
        .hero-container {
          grid-template-columns: 1fr !important;
          text-align: center;
        }
        
        .features-grid {
          grid-template-columns: 1fr !important;
        }
        
        .stats-grid {
          grid-template-columns: repeat(2, 1fr) !important;
        }
        
        .nav-menu {
          display: none !important;
        }
      }
      
      @media (max-width: 480px) {
        .stats-grid {
          grid-template-columns: 1fr !important;
        }
        
        .button-group {
          flex-direction: column;
        }
        
        .button-group button {
          width: 100%;
        }
      }
    `;
    document.head.appendChild(style);
  }, []);

  return (
    <div style={styles.container}>
      {/* Navbar */}
      <nav style={styles.navbar}>
        <div style={styles.navContainer}>
          <div style={styles.logo}>PathFinder</div>

          <div style={styles.navMenu}>
            {['Home', 'Features', 'How It Works', 'About'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                style={styles.navLink}
                onMouseEnter={(e) => e.target.style.color = '#f48fb1'}
                onMouseLeave={(e) => e.target.style.color = '#4a5568'}
              >
                {item}
              </a>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              style={styles.buttonOutline}
              onMouseEnter={(e) => {
                e.target.style.background = '#fce4ec';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              Login
            </button>
            <button
              style={styles.buttonGradient}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 5px 20px rgba(240, 98, 146, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              Register
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={styles.heroSection}>
        <div style={styles.heroContainer}>
          <div className="animate-fade-in">
            <h1 style={styles.heroTitle}>
              Find Your Future. <br />
              <span style={styles.heroGradient}>Connect. Apply. Succeed.</span>
            </h1>
            <p style={styles.heroSubtitle}>
              PathFinder connects students with top companies, making internships and job applications smarter and easier.
            </p>
            <div style={styles.buttonGroup}>
              <button
                style={styles.buttonPrimary}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-3px)';
                  e.target.style.boxShadow = '0 8px 25px rgba(240, 98, 146, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 5px 15px rgba(240, 98, 146, 0.3)';
                }}
              >
                Get Started
              </button>
              <button
                style={styles.buttonSecondary}
                onMouseEnter={(e) => {
                  e.target.style.background = '#fce4ec';
                  e.target.style.transform = 'translateY(-3px)';
                  e.target.style.boxShadow = '0 5px 20px rgba(244, 143, 177, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                Explore Jobs
              </button>
            </div>
          </div>

          {/* Illustration */}
          <div style={styles.illustrationContainer} className="animate-float">
            <div style={styles.illustrationGrid}>
              <div style={styles.illustrationCard}>
                <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #f48fb1, #f06292)', borderRadius: '50%', marginBottom: '1rem' }}></div>
                <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', width: '75%', marginBottom: '0.5rem' }}></div>
                <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', width: '50%' }}></div>
              </div>
              <div style={{ ...styles.illustrationCard, transform: 'translateY(30px)' }}>
                <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #f06292, #ec407a)', borderRadius: '50%', marginBottom: '1rem' }}></div>
                <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', width: '75%', marginBottom: '0.5rem' }}></div>
                <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', width: '50%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={styles.featuresSection}>
        <div style={styles.sectionContainer}>
          <h2 style={styles.sectionTitle}>
            Everything You Need in One Platform
            <div style={styles.sectionTitleAfter}></div>
          </h2>

          <div style={styles.featuresGrid}>
            {/* Feature Card 1 */}
            <div
              style={styles.featureCard}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-10px)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(244, 143, 177, 0.15)';
                e.currentTarget.style.borderColor = '#f48fb1';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.05)';
                e.currentTarget.style.borderColor = '#fce4ec';
              }}
            >
              <div style={styles.featureIcon}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#f06292">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 style={styles.featureTitle}>For Students</h3>
              <p style={styles.featureDescription}>Discover and track internships that match your skills and career goals.</p>
            </div>

            {/* Feature Card 2 */}
            <div
              style={styles.featureCard}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-10px)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(244, 143, 177, 0.15)';
                e.currentTarget.style.borderColor = '#f48fb1';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.05)';
                e.currentTarget.style.borderColor = '#fce4ec';
              }}
            >
              <div style={styles.featureIcon}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#f06292">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 style={styles.featureTitle}>For Companies</h3>
              <p style={styles.featureDescription}>Post jobs and manage applicants efficiently with our smart tools.</p>
            </div>

            {/* Feature Card 3 */}
            <div
              style={styles.featureCard}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-10px)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(244, 143, 177, 0.15)';
                e.currentTarget.style.borderColor = '#f48fb1';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.05)';
                e.currentTarget.style.borderColor = '#fce4ec';
              }}
            >
              <div style={styles.featureIcon}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#f06292">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 style={styles.featureTitle}>For Admins</h3>
              <p style={styles.featureDescription}>Comprehensive platform management and detailed analytics.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={styles.statsSection}>
        <div style={styles.statsGrid}>
          <div style={styles.statItem}>
            <div style={styles.statNumber}>10K+</div>
            <div style={styles.statLabel}>Students</div>
          </div>
          <div style={styles.statItem}>
            <div style={styles.statNumber}>500+</div>
            <div style={styles.statLabel}>Companies</div>
          </div>
          <div style={styles.statItem}>
            <div style={styles.statNumber}>5K+</div>
            <div style={styles.statLabel}>Jobs Posted</div>
          </div>
          <div style={styles.statItem}>
            <div style={styles.statNumber}>25K+</div>
            <div style={styles.statLabel}>Applications</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        © 2026 PathFinder. All rights reserved.
      </footer>
    </div>
  );
}

export default App;