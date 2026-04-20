import { useState } from 'react';
import '../styles/ProfilePage.css';

function getInitials(name, email) {
  if (name) {
    const parts = name.trim().split(' ');
    return parts.map((part) => part[0].toUpperCase()).slice(0, 2).join('');
  }
  if (email) return email[0].toUpperCase();
  return 'SM';
}

export default function ProfilePage({
  user,
  authLoading,
  error,
  message,
  t,
  onEmailAuth,
  onGoogleSignIn,
  onSignOut,
  isAdmin,
  firebaseReady,
  userAdsCount = 0,
  userFavoritesCount = 0,
}) {
  const [authMode, setAuthMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (authLoading) {
    return (
      <div className="container">
        <section className="profile-loading-card">
          <div className="profile-spinner" />
          <p>{t.userLoading}</p>
        </section>
      </div>
    );
  }

  const isAnonymous = Boolean(user?.isAnonymous);
  const showAuthForm = !user || isAnonymous;
  const initials = getInitials(user?.displayName, user?.email);

  const switchMode = (mode) => {
    setAuthMode(mode);
    setPassword('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const success = await onEmailAuth({ mode: authMode, name, email, password });
    if (!success) return;
    if (authMode === 'login') {
      setPassword('');
    } else {
      setName('');
      setEmail('');
      setPassword('');
    }
  };

  return (
    <div className="container">
      <div className="profile-page">

        {/* User identity card */}
        <div className="profile-identity-card">
          <div className="profile-avatar-wrap">
            <div className="profile-avatar-circle">{initials}</div>
          </div>
          <div className="profile-identity-info">
            <div className="profile-identity-name">
              {isAnonymous
                ? t.guestAnonymous
                : user?.displayName || user?.email || t.notAuthorized}
            </div>
            <div className="profile-identity-sub">
              {isAnonymous ? t.profileSigninPrompt : t.profileWelcomeText}
            </div>
            {isAdmin && (
              <span className="profile-admin-badge">{t.adminBadge}</span>
            )}
          </div>
        </div>

        {/* User Statistics */}
        {!isAnonymous && !showAuthForm && (
          <div className="profile-stats-card">
            <div className="profile-stat-item">
              <div className="profile-stat-icon">📢</div>
              <div className="profile-stat-content">
                <div className="profile-stat-label">Мои объявления</div>
                <div className="profile-stat-value">{userAdsCount}</div>
              </div>
            </div>
            <div className="profile-stat-item">
              <div className="profile-stat-icon">❤️</div>
              <div className="profile-stat-content">
                <div className="profile-stat-label">Избранные</div>
                <div className="profile-stat-value">{userFavoritesCount}</div>
              </div>
            </div>
            <div className="profile-stat-item">
              <div className="profile-stat-icon">⭐</div>
              <div className="profile-stat-content">
                <div className="profile-stat-label">Рейтинг</div>
                <div className="profile-stat-value">5.0</div>
              </div>
            </div>
          </div>
        )}

        {/* Feedback messages */}
        {error && <div className="profile-error">{error}</div>}
        {message && <div className="profile-message">{message}</div>}

        {showAuthForm ? (
          /* ─── Auth form ─── */
          <div className="profile-auth-card">
            <div className="profile-auth-header">
              <div>
                <h2>{t.authPanelTitle}</h2>
                <p>{t.authPanelDescription}</p>
              </div>
              <div className="profile-mode-tabs" role="tablist" aria-label={t.authPanelTitle}>
                <button
                  type="button"
                  className={`profile-mode-tab ${authMode === 'login' ? 'active' : ''}`}
                  onClick={() => switchMode('login')}
                >
                  {t.authModeLogin}
                </button>
                <button
                  type="button"
                  className={`profile-mode-tab ${authMode === 'register' ? 'active' : ''}`}
                  onClick={() => switchMode('register')}
                >
                  {t.authModeRegister}
                </button>
              </div>
            </div>

            <form className="profile-form" onSubmit={handleSubmit}>
              {authMode === 'register' && (
                <label className="profile-field">
                  <span>{t.authNameLabel}</span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t.authNamePlaceholder}
                    autoComplete="name"
                  />
                </label>
              )}
              <label className="profile-field">
                <span>{t.userEmail}</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.authEmailPlaceholder}
                  autoComplete="email"
                />
              </label>
              <label className="profile-field">
                <span>{t.authPasswordLabel}</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.authPasswordPlaceholder}
                  autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
                />
              </label>

              <div className="profile-form-actions">
                <button
                  className="profile-btn profile-btn-primary"
                  type="submit"
                  disabled={authLoading || !firebaseReady}
                >
                  {authLoading
                    ? t.authSubmitLoading
                    : authMode === 'login'
                    ? t.authSubmitLogin
                    : t.authSubmitRegister}
                </button>
                <button
                  className="profile-btn profile-btn-google"
                  type="button"
                  onClick={onGoogleSignIn}
                  disabled={authLoading || !firebaseReady}
                >
                  {t.loginGoogle}
                </button>
              </div>
            </form>

            <div className="profile-switch-row">
              <span>{authMode === 'login' ? t.authSwitchToRegister : t.authSwitchToLogin}</span>
              <button
                type="button"
                className="profile-link-btn"
                onClick={() => switchMode(authMode === 'login' ? 'register' : 'login')}
              >
                {authMode === 'login' ? t.authSwitchActionRegister : t.authSwitchActionLogin}
              </button>
            </div>
          </div>
        ) : (
          /* ─── Account details ─── */
          <div className="profile-details-card">
            <div className="profile-details-grid">
              <div className="profile-detail-item">
                <span className="profile-detail-label">{t.userEmail}</span>
                <span className="profile-detail-value">{user?.email || '—'}</span>
              </div>
              <div className="profile-detail-item">
                <span className="profile-detail-label">{t.userUid}</span>
                <span className="profile-detail-value profile-uid">{user?.uid}</span>
              </div>
              <div className="profile-detail-item">
                <span className="profile-detail-label">{t.userProvider}</span>
                <span className="profile-detail-value">
                  {user?.providerData[0]?.providerId || 'anonymous'}
                </span>
              </div>
            </div>
            <button
              className="profile-btn profile-btn-signout"
              onClick={onSignOut}
              disabled={authLoading || !firebaseReady}
            >
              {t.signOut}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}