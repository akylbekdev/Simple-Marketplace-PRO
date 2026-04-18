import '../styles/AdminPanel.css';

export default function AdminPanel({ ads, onDelete, t }) {
  const totalUsers = new Set(ads.filter((ad) => ad.createdBy).map((ad) => ad.createdBy)).size;
  const categoryCounts = ads.reduce((acc, ad) => {
    if (!ad.category) return acc;
    acc[ad.category] = (acc[ad.category] || 0) + 1;
    return acc;
  }, {});

  return (
    <section className="admin-panel">
      <div className="admin-panel-header">
        <div>
          <h2>{t.adminTitle}</h2>
          <p>{t.adminDescription}</p>
        </div>
      </div>

      <div className="admin-stat-grid">
        <div className="admin-stat-card">
          <span>{t.totalAds}</span>
          <strong>{ads.length}</strong>
        </div>
        <div className="admin-stat-card">
          <span>{t.totalUsers}</span>
          <strong>{totalUsers}</strong>
        </div>
        <div className="admin-stat-card admin-stat-card-full">
          <span>{t.categoriesByAds}</span>
          <div className="admin-category-list">
            {Object.entries(categoryCounts).map(([category, count]) => (
              <div key={category} className="admin-category-item">
                <span>{category}</span>
                <strong>{count}</strong>
              </div>
            ))}
            {Object.keys(categoryCounts).length === 0 && <div>{t.noCategoriesYet}</div>}
          </div>
        </div>
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>{t.adTitle}</th>
              <th>{t.category}</th>
              <th>{t.price}</th>
              <th>{t.author}</th>
              <th>{t.actions}</th>
            </tr>
          </thead>
          <tbody>
            {ads.slice(0, 8).map((ad) => (
              <tr key={ad.id}>
                <td>{ad.title}</td>
                <td>{ad.category}</td>
                <td>{Number(ad.price).toLocaleString('ru-RU')} сом</td>
                <td>{ad.userName || t.anonymousUser}</td>
                <td>
                  <button className="admin-delete-btn" onClick={() => onDelete(ad.id)}>
                    {t.delete}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
