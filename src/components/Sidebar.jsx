import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Sidebar.css';

export default function Sidebar({ t, isAdmin }) {
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  const closeMobileSidebar = () => {
    setIsMobileOpen(false);
  };

  return (
    <div className={`sidebar-wrapper ${isMobileOpen ? 'is-mobile-open' : ''}`}>
      <button
        type="button"
        className="sidebar-toggle"
        onClick={() => setIsMobileOpen((prev) => !prev)}
        aria-label="Открыть каталог страниц"
        aria-expanded={isMobileOpen}
      >
        ☰
      </button>
      <button
        type="button"
        className="sidebar-backdrop"
        onClick={closeMobileSidebar}
        aria-label="Закрыть каталог"
      />
      <aside className="sidebar">
        <nav className="sidebar-nav">
          <Link
            to="/"
            className={`sidebar-link ${location.pathname === '/' ? 'active' : ''}`}
            onClick={closeMobileSidebar}
          >
            🏠 {t.home}
          </Link>
          <Link
            to="/browse"
            className={`sidebar-link ${location.pathname === '/browse' ? 'active' : ''}`}
            onClick={closeMobileSidebar}
          >
            🔎 {t.browse}
          </Link>
          <Link
            to="/sell"
            className={`sidebar-link ${location.pathname === '/sell' ? 'active' : ''}`}
            onClick={closeMobileSidebar}
          >
            🛒 {t.sell}
          </Link>
          <Link
            to="/my-ads"
            className={`sidebar-link ${location.pathname === '/my-ads' ? 'active' : ''}`}
            onClick={closeMobileSidebar}
          >
            📋 {t.navMyAds}
          </Link>
          <Link
            to="/stats"
            className={`sidebar-link ${location.pathname === '/stats' ? 'active' : ''}`}
            onClick={closeMobileSidebar}
          >
            📊 {t.stats}
          </Link>
          <Link
            to="/tracker"
            className={`sidebar-link ${location.pathname === '/tracker' ? 'active' : ''}`}
            onClick={closeMobileSidebar}
          >
            💸 {t.tracker}
          </Link>
          <Link
            to="/help"
            className={`sidebar-link ${location.pathname === '/help' ? 'active' : ''}`}
            onClick={closeMobileSidebar}
          >
            ❓ {t.help}
          </Link>
          <Link
            to="/about"
            className={`sidebar-link ${location.pathname === '/about' ? 'active' : ''}`}
            onClick={closeMobileSidebar}
          >
            ℹ️ {t.about}
          </Link>
        </nav>
        <div className="sidebar-footer">
          {isAdmin && (
            <Link
              to="/admin"
              className={`sidebar-link ${location.pathname === '/admin' ? 'active' : ''}`}
              onClick={closeMobileSidebar}
            >
              ⚙️ {t.admin}
            </Link>
          )}
          <Link
            to="/profile"
            className={`sidebar-link ${location.pathname === '/profile' ? 'active' : ''}`}
            onClick={closeMobileSidebar}
          >
            <span className="sidebar-avatar">👤</span>
            {t.profile}
          </Link>
        </div>
      </aside>
    </div>
  );
}