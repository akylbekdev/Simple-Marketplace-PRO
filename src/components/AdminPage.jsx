import AdminPanel from './AdminPanel';

export default function AdminPage({ ads, onDelete, t }) {
  return (
    <div className="container">
      <section className="section">
        <h2>{t.adminTitle}</h2>
        <AdminPanel ads={ads} onDelete={onDelete} t={t} />
      </section>
    </div>
  );
}