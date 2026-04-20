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

  const handleSubmit = async (event, mode) => {
    event.preventDefault();
    const success = await onEmailAuth({ mode, name, email, password });
    if (!success) return;
    if (mode === 'register') {
      setName('');
      setEmail('');
      setPassword('');
      return;
    }
    setPassword('');
  };

  return (
    <div className="container">
      <div className="profile-page">
        {showAuthForm ? (
          <div className="profile-auth-card">
            <div className="profile-auth-head">
              <h2 className="profile-auth-title">{t.userProfile}</h2>
              <p className="profile-auth-subtitle">Simple Marketplace</p>
            </div>

            {error && <div className="profile-error">{error}</div>}
            {message && <div className="profile-message">{message}</div>}

            <form className="profile-form" onSubmit={(event) => handleSubmit(event, 'login')}>
              <input
                className="profile-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={`${t.authNamePlaceholder} (${t.authModeRegister})`}
                autoComplete="name"
              />

              <input
                className="profile-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.authEmailPlaceholder}
                autoComplete="email"
              />

              <input
                className="profile-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.authPasswordPlaceholder}
                autoComplete="current-password"
              />

              <div className="profile-auth-actions">
                <button
                  className="profile-btn-primary"
                  type="submit"
                  disabled={authLoading || !firebaseReady}
                >
                  {authLoading ? t.authSubmitLoading : t.authSubmitLogin}
                </button>

                <button
                  className="profile-btn-secondary"
                  type="button"
                  onClick={(event) => handleSubmit(event, 'register')}
                  disabled={authLoading || !firebaseReady}
                >
                  {authLoading ? t.authSubmitLoading : t.authSubmitRegister}
                </button>
              </div>
            </form>

            <div className="profile-social-section">
              <span className="profile-social-label">
                {t.loginGoogle ? 'Или войти через Google' : 'Or continue with Google'}
              </span>
              <button
                type="button"
                className="profile-google-btn"
                onClick={onGoogleSignIn}
                disabled={authLoading || !firebaseReady}
                aria-label="Google"
              >
                <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                <span>Google</span>
              </button>
            </div>

          </div>
        ) : (
          <div className="profile-account-card">
            <h2 className="profile-auth-title">Профиль</h2>

            <div className="profile-account-head">
              <div className="profile-avatar-circle">{initials}</div>
              <div className="profile-identity-name" title={user?.displayName || user?.email || ''}>
                {user?.displayName || user?.email || t.notAuthorized}
              </div>
              <div className="profile-identity-sub" title={user?.email || ''}>{user?.email}</div>
              {isAdmin && <span className="profile-admin-badge">{t.adminBadge}</span>}
            </div>

            <div className="profile-stats-strip">
              <div className="profile-stat-item">
                <div className="profile-stat-value">{userAdsCount}</div>
                <div className="profile-stat-label">Объявления</div>
              </div>
              <div className="profile-stat-item">
                <div className="profile-stat-value">{userFavoritesCount}</div>
                <div className="profile-stat-label">Избранное</div>
              </div>
              <div className="profile-stat-item">
                <div className="profile-stat-value">5.0</div>
                <div className="profile-stat-label">Рейтинг</div>
              </div>
            </div>

            {error && <div className="profile-error">{error}</div>}
            {message && <div className="profile-message">{message}</div>}

            <div className="profile-details-card">
              <div className="profile-details-grid">
                <div className="profile-detail-item">
                  <span className="profile-detail-label">{t.userEmail}</span>
                  <span className="profile-detail-value">{user?.email || '-'}</span>
                </div>
                <div className="profile-detail-item">
                  <span className="profile-detail-label">{t.userProvider}</span>
                  <span className="profile-detail-value">{user?.providerData[0]?.providerId || 'anonymous'}</span>
                </div>
              </div>
            </div>

            <button
              className="profile-btn-signout"
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