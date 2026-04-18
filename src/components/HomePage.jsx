import { Link } from 'react-router-dom';
import MarketplaceStats from './MarketplaceStats';

export default function HomePage({ allAds, user, t }) {
  const categoryCounts = allAds.reduce((acc, ad) => {
    if (!ad.category) return acc;
    acc[ad.category] = (acc[ad.category] || 0) + 1;
    return acc;
  }, {});

  const topCategory = Object.keys(categoryCounts).reduce(
    (a, b) => (categoryCounts[a] >= categoryCounts[b] ? a : b),
    Object.keys(categoryCounts)[0] || t.noAdsYet
  );

  const newestAdTitle = allAds
    .slice()
    .sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
      const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
      return dateB - dateA;
    })[0]?.title || t.noAdsYet;

  return (
    <div className="container">
      <section className="section">
        <h2>{t.dashboard}</h2>
        <p>{t.welcome}</p>

        <div className="quick-actions">
          <Link className="action-card action-card-primary" to="/browse">
            <strong>{t.browse}</strong>
            <p>{t.searchWithFilters}</p>
          </Link>
          <Link className="action-card action-card-primary" to="/sell">
            <strong>{t.sell}</strong>
            <p>{t.addAdHeading}</p>
          </Link>
          <Link className="action-card" to="/my-ads">
            <strong>{t.navMyAds}</strong>
            <p>{t.showMine}</p>
          </Link>
        </div>
      </section>

      <MarketplaceStats
        totalAds={allAds.length}
        myAdsCount={allAds.filter((ad) => ad.createdBy === user?.uid).length}
        topCategory={topCategory || t.noAdsYet}
        newestAdTitle={newestAdTitle}
        categoryCounts={categoryCounts}
        t={t}
      />
    </div>
  );
}