import { Link, useLocation } from 'react-router-dom';
import '../styles/Sidebar.css';

export default function Sidebar({ t, isAdmin }) {
  const location = useLocation();

  return (
    <div className="sidebar-wrapper">
      <aside className="sidebar">
        <nav className="sidebar-nav">
          <Link
            to="/"
            className={`sidebar-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            🏠 {t.home}
          </Link>
          <Link
            to="/browse"
            className={`sidebar-link ${location.pathname === '/browse' ? 'active' : ''}`}
          >
            🔎 {t.browse}
          </Link>
          <Link
            to="/sell"
            className={`sidebar-link ${location.pathname === '/sell' ? 'active' : ''}`}
          >
            🛒 {t.sell}
          </Link>
          <Link
            to="/my-ads"
            className={`sidebar-link ${location.pathname === '/my-ads' ? 'active' : ''}`}
          >
            📋 {t.navMyAds}
          </Link>
          <Link
            to="/stats"
            className={`sidebar-link ${location.pathname === '/stats' ? 'active' : ''}`}
          >
            📊 {t.stats}
          </Link>
          <Link
            to="/tracker"
            className={`sidebar-link ${location.pathname === '/tracker' ? 'active' : ''}`}
          >
            💸 {t.tracker}
          </Link>
          <Link
            to="/help"
            className={`sidebar-link ${location.pathname === '/help' ? 'active' : ''}`}
          >
            ❓ {t.help}
          </Link>
          <Link
            to="/about"
            className={`sidebar-link ${location.pathname === '/about' ? 'active' : ''}`}
          >
            ℹ️ {t.about}
          </Link>
        </nav>
        <div className="sidebar-footer">
          {isAdmin && (
            <Link
              to="/admin"
              className={`sidebar-link ${location.pathname === '/admin' ? 'active' : ''}`}
            >
              ⚙️ {t.admin}
            </Link>
          )}
          <Link
            to="/profile"
            className={`sidebar-link ${location.pathname === '/profile' ? 'active' : ''}`}
          >
            <span className="sidebar-avatar">👤</span>
            {t.profile}
          </Link>
        </div>
      </aside>
    </div>
  );
}