import MarketplaceStats from './MarketplaceStats';

export default function StatsPage({ allAds, user, t }) {
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
        <h2>{t.stats}</h2>
        <p>{t.home}</p>
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
