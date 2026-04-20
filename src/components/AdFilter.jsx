import { useState } from 'react';
import '../styles/AdFilter.css';

export default function AdFilter({
  searchValue,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  sortOrder,
  onSortChange,
  showMine,
  onShowMineChange,
  categories: categoriesProp,
  minPrice,
  onMinPriceChange,
  maxPrice,
  onMaxPriceChange,
  t
}) {
  const categories = Array.isArray(categoriesProp)
    ? categoriesProp
    : Array.isArray(t.categories)
    ? t.categories
    : [];

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
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-section">
        <label>{t.priceLabel || 'Цена'}</label>
        <div className="price-filter">
          <div className="price-input-group">
            <label htmlFor="minPrice">От:</label>
            <input
              id="minPrice"
              type="number"
              min="0"
              value={minPrice}
              onChange={(e) => onMinPriceChange(Number(e.target.value))}
              className="price-input"
            />
          </div>
          <div className="price-input-group">
            <label htmlFor="maxPrice">До:</label>
            <input
              id="maxPrice"
              type="number"
              min="0"
              value={maxPrice}
              onChange={(e) => onMaxPriceChange(Number(e.target.value))}
              className="price-input"
            />
          </div>
        </div>
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
