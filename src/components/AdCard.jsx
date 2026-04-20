import { useState, useEffect, useRef } from 'react';
import '../styles/AdCard.css';

export default function AdCard({ ad, onDelete, onFavoriteToggle, isFavorite, loading, isOwner, isAdmin, t }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [shouldLoadImage, setShouldLoadImage] = useState(false);
  const imageRef = useRef(null);
  const localeCode = t.locale === 'en' ? 'en-US' : t.locale === 'kr' ? 'ko-KR' : 'ru-RU';

  // Lazy loading with Intersection Observer
  useEffect(() => {
    if (!imageRef.current) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setShouldLoadImage(true);
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '50px' });

    observer.observe(imageRef.current);

    return () => {
      if (imageRef.current) {
        observer.unobserve(imageRef.current);
      }
    };
  }, []);

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
      {ad.imageUrl ? (
        <div className="ad-image-wrapper" ref={imageRef}>
          {shouldLoadImage ? (
            <>
              <img 
                src={ad.imageUrl} 
                alt={ad.title} 
                className={`ad-image ${imageLoaded ? 'loaded' : ''}`}
                onLoad={() => setImageLoaded(true)}
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
            </>
          ) : (
            <div className="ad-image-skeleton">
              <div className="skeleton-shimmer"></div>
            </div>
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