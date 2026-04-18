import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ADMIN_EMAILS = ['admin@marketplace.com', 'manager@marketplace.com']; // Замените на реальные email администраторов

export default function AdminLoginPage({ t }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Проверка email
    if (!email.trim()) {
      setError('Введите email');
      setLoading(false);
      return;
    }

    if (!ADMIN_EMAILS.includes(email.toLowerCase())) {
      setError('Доступ запрещен. Этот email не имеет прав администратора.');
      setLoading(false);
      return;
    }

    // Сохраняем в localStorage
    localStorage.setItem('admin-logged-in', 'true');
    localStorage.setItem('admin-email', email.toLowerCase());

    // Перенаправляем на админ панель
    navigate('/admin');
  };

  return (
    <div className="container">
      <section className="section">
        <h2>Вход в админ панель</h2>
        <p>Введите ваш email администратора для доступа к панели управления.</p>

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="form-group">
            <label htmlFor="admin-email">Email администратора</label>
            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@marketplace.com"
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading} className="admin-login-btn">
            {loading ? 'Проверяем...' : 'Войти'}
          </button>
        </form>
      </section>
    </div>
  );
}