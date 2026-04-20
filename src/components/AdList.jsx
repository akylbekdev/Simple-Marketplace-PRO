import { useState } from 'react';
import AdCard from './AdCard';
import '../styles/AdList.css';

export default function AdList({ ads, loading, error, onDelete, onFavoriteToggle, isFavorite, currentUser, isAdmin, t }) {
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (adId) => {
    setDeletingId(adId);
    try {
      await onDelete(adId);
    } catch (err) {
      console.error('Ошибка при удалении объявления:', err);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="ad-list loading">
        <div className="empty-state">
          <div className="empty-icon">⏳</div>
          <p>{t.loadingAds}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ad-list error">
        <div className="empty-state error-state">
          <div className="empty-icon">❌</div>
          <p>{t.errorLoadingAds}{error}</p>
        </div>
      </div>
    );
  }

  if (ads.length === 0) {
    return (
      <div className="ad-list empty">
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>{t.noAdsFound}</h3>
          <p>Попробуйте изменить фильтры или параметры поиска</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ad-list">
      <h2>{t.adsHeading} ({ads.length})</h2>
      <div className="ads-grid">
        {ads.map((ad) => (
          <AdCard
            key={ad.id}
            ad={ad}
            onDelete={handleDelete}
            onFavoriteToggle={onFavoriteToggle}
            isFavorite={isFavorite ? isFavorite(ad.id) : false}
            loading={deletingId === ad.id}
            isOwner={currentUser?.uid === ad.createdBy}
            isAdmin={isAdmin}
            t={t}
          />
        ))}
      </div>
    </div>
  );
}
