// components/RoleCard.jsx
import { Link } from "react-router-dom";

export default function RoleCard({ 
  title, 
  description, 
  icon, 
  to, 
  features = [], 
  action,
  tone = 'student' 
}) {
  const colors = {
    student: {
      primary: 'var(--primary)',
      light: 'rgba(10, 36, 114, 0.05)',
      border: 'rgba(10, 36, 114, 0.2)'
    },
    company: {
      primary: 'var(--secondary)',
      light: 'rgba(46, 196, 182, 0.05)',
      border: 'rgba(46, 196, 182, 0.2)'
    },
    admin: {
      primary: 'var(--accent)',
      light: 'rgba(255, 107, 107, 0.05)',
      border: 'rgba(255, 107, 107, 0.2)'
    }
  };

  const color = colors[tone] || colors.student;

  return (
    <Link 
      to={to} 
      className="card"
      style={{
        padding: 32,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        transition: 'var(--transition)',
        border: '1px solid var(--border)',
        background: 'white'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 20px 40px rgba(10, 36, 114, 0.1)';
        e.currentTarget.style.borderColor = color.primary;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--shadow)';
        e.currentTarget.style.borderColor = 'var(--border)';
      }}
    >
      {/* Icon */}
      <div style={{
        width: 56,
        height: 56,
        borderRadius: 16,
        background: color.light,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 28,
        marginBottom: 24,
        color: color.primary
      }}>
        {icon}
      </div>

      {/* Content */}
      <div style={{ flex: 1 }}>
        <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
          {title}
        </h3>
        <p style={{ color: 'var(--muted)', lineHeight: 1.6, marginBottom: 20 }}>
          {description}
        </p>

        {/* Features List */}
        {features.length > 0 && (
          <ul style={{ listStyle: 'none', padding: 0, marginBottom: 24 }}>
            {features.map((feature, i) => (
              <li key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 8,
                fontSize: 14,
                color: 'var(--text)'
              }}>
                <span style={{ color: color.primary, fontSize: 18 }}>✓</span>
                {feature}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Action Button */}
      <div style={{
        padding: '16px 0 0',
        borderTop: '1px solid var(--border)',
        marginTop: 16
      }}>
        <span style={{
          color: color.primary,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {action || `Continue as ${title}`}
          <span style={{ fontSize: 20 }}>→</span>
        </span>
      </div>
    </Link>
  );
}