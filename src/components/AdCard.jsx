import { useState, useEffect } from 'react';
import '../styles/AdCard.css';

export default function AdCard({ ad, onDelete, onFavoriteToggle, isFavorite, loading, isOwner, isAdmin, t }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const localeCode = t.locale === 'en' ? 'en-US' : t.locale === 'kr' ? 'ko-KR' : 'ru-RU';
  const effectiveImageUrl = ad.imageUrl || '';

  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
  }, [effectiveImageUrl]);

  const formatDate = (timestamp) => {
    if (!timestamp) return t.dateUnknown;
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString(localeCode, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDelete = () => {
    if (window.confirm(t.confirmDelete)) {
      onDelete(ad.id);
    }
  };

  const handleFavoriteClick = () => {
    if (onFavoriteToggle) {
      onFavoriteToggle(ad.id);
    }
  };

  return (
    <article className="ad-card">
      {effectiveImageUrl && !imageError ? (
        <div className="ad-image-wrapper">
          <img
            src={effectiveImageUrl}
            alt={ad.title}
            className={`ad-image ${imageLoaded ? 'loaded' : ''}`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            loading="lazy"
          />
          {onFavoriteToggle && (
            <button
              className={`favorite-btn ${isFavorite ? 'active' : ''}`}
              onClick={handleFavoriteClick}
              title={isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
              aria-label="Избранное"
            >
              {isFavorite ? '❤️' : '🤍'}
            </button>
          )}
        </div>
      ) : (
        <div className="ad-image-placeholder">{t.noPhoto}</div>
      )}

      <div className="ad-header">
        <div className="ad-title-block">
          <h3>{ad.title}</h3>
          <span className="ad-category-tag">{ad.category}</span>
        </div>
        <div className="ad-price">
          {Number(ad.price).toLocaleString(localeCode)} {t.currencySuffix}
        </div>
      </div>

      <div className="ad-meta-row">
        <span className="ad-author">{t.postedBy}: {ad.userName || t.anonymousUser}</span>
        <span className="ad-date">{formatDate(ad.createdAt)}</span>
      </div>

      {(isOwner || isAdmin) && (
        <button
          className="delete-btn"
          onClick={handleDelete}
          disabled={loading}
          title={t.delete}
        >
          {loading ? '⏳' : t.delete}
        </button>
      )}
    </article>
  );
}