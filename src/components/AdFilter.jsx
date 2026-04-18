import '../styles/AdFilter.css';

const CATEGORIES = ['Электроника', 'Кийим', 'Авто', 'Башка'];

export default function AdFilter({
  searchValue,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  sortOrder,
  onSortChange,
  showMine,
  onShowMineChange,
  t
}) {
  return (
    <div className="ad-filter">
      <div className="filter-section">
        <label htmlFor="search">{t.searchLabel}</label>
        <input
          id="search"
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t.searchPlaceholder}
          className="search-input"
        />
      </div>

      <div className="filter-section">
        <label htmlFor="category">{t.category}</label>
        <select
          id="category"
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="category-select"
        >
          <option value="">{t.allCategories}</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-section">
        <label htmlFor="sort">{t.sortLabel}</label>
        <select
          id="sort"
          value={sortOrder}
          onChange={(e) => onSortChange(e.target.value)}
          className="sort-select"
        >
          <option value="newest">{t.sortNewest}</option>
          <option value="oldest">{t.sortOldest}</option>
          <option value="asc">{t.sortAsc}</option>
          <option value="desc">{t.sortDesc}</option>
        </select>
      </div>

      <div className="filter-section filter-checkbox">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={showMine}
            onChange={(e) => onShowMineChange(e.target.checked)}
          />
          {t.showMine}
        </label>
      </div>
    </div>
  );
}
