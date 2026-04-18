import '../styles/AdCard.css';

export default function AdCard({ ad, onDelete, loading, isOwner, isAdmin, t }) {
  const localeCode = t.locale === 'en' ? 'en-US' : t.locale === 'kr' ? 'ko-KR' : 'ru-RU';

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

  return (
    <article className="ad-card">
      {ad.imageUrl ? (
        <div className="ad-image-wrapper">
          <img src={ad.imageUrl} alt={ad.title} className="ad-image" />
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