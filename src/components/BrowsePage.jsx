import AdFilter from './AdFilter';
import AdList from './AdList';
import MarketplaceStats from './MarketplaceStats';

export default function BrowsePage({
  allAds,
  filteredAds,
  searchValue,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  sortOrder,
  onSortChange,
  showMine,
  onShowMineChange,
  minPrice,
  onMinPriceChange,
  maxPrice,
  onMaxPriceChange,
  onFavoriteToggle,
  isFavorite,
  user,
  loading,
  error,
  usingDemoAds,
  onDelete,
  t
}) {
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

  const categoriesFromAds = [...new Set(allAds.map((ad) => ad.category).filter(Boolean))];

  return (
    <div className="container">
      <section className="section">
        <h2>{t.browse}</h2>
        <p>{t.searchWithFilters}</p>
        {usingDemoAds && <p className="demo-note">{t.demoModeBadge}</p>}
      </section>

      <MarketplaceStats
        totalAds={allAds.length}
        myAdsCount={allAds.filter((ad) => ad.createdBy === user?.uid).length}
        topCategory={topCategory || t.noAdsYet}
        newestAdTitle={newestAdTitle}
        categoryCounts={categoryCounts}
        t={t}
      />

      <div className="main-grid">
        <section className="section panel-left">
          <AdFilter
            searchValue={searchValue}
            onSearchChange={onSearchChange}
            selectedCategory={selectedCategory}
            onCategoryChange={onCategoryChange}
            sortOrder={sortOrder}
            onSortChange={onSortChange}
            showMine={showMine}
            onShowMineChange={onShowMineChange}
            categories={categoriesFromAds.length ? categoriesFromAds : t.categories}
            minPrice={minPrice}
            onMinPriceChange={onMinPriceChange}
            maxPrice={maxPrice}
            onMaxPriceChange={onMaxPriceChange}
            t={t}
          />
        </section>

        <section className="panel-right">
          <AdList
            ads={filteredAds}
            loading={loading}
            error={error}
            onDelete={onDelete}
            onFavoriteToggle={onFavoriteToggle}
            isFavorite={isFavorite}
            currentUser={user}
            isAdmin={false}
            t={t}
          />
        </section>
      </div>
    </div>
  );
}
