import '../styles/MarketplaceStats.css';

export default function MarketplaceStats({ totalAds, myAdsCount, topCategory, newestAdTitle, categoryCounts, t }) {
  return (
    <section className="stats-panel">
      <div className="stats-card stats-card-accent">
        <span className="stats-label">{t.totalAds}</span>
        <strong>{totalAds}</strong>
      </div>

      <div className="stats-card">
        <span className="stats-label">{t.myAds}</span>
        <strong>{myAdsCount}</strong>
      </div>

      <div className="stats-card">
        <span className="stats-label">{t.topCategory}</span>
        <strong>{topCategory}</strong>
      </div>

      <div className="stats-card">
        <span className="stats-label">{t.newestAd}</span>
        <strong>{newestAdTitle}</strong>
      </div>

      <div className="stats-card stats-card-fullwidth">
        <span className="stats-label">{t.activeCategories}</span>
        <div className="stats-category-list">
          {Object.entries(categoryCounts).map(([category, count]) => (
            <div key={category} className="stats-category-item">
              <span>{category}</span>
              <strong>{count}</strong>
            </div>
          ))}
          {Object.keys(categoryCounts).length === 0 && <div>{t.noAdsYet}</div>}
        </div>
      </div>
    </section>
  );
}
