import { useState } from 'react';
import AdCard from './AdCard';
import '../styles/AdList.css';

export default function AdList({ ads, loading, error, onDelete, currentUser, isAdmin, t }) {
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (adId) => {
    setDeletingId(adId);
    try {
      await onDelete(adId);
    } catch (err) {
      console.error('Ошибка при удалении объявления:', err);
      alert((t?.errorLoadingAds || 'Ошибка: ') + (err?.message || t?.delete || '')); 
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return <div className="ad-list loading">{t.loadingAds}</div>;
  }

  if (error) {
    return <div className="ad-list error">{t.errorLoadingAds}{error}</div>;
  }

  if (ads.length === 0) {
    return <div className="ad-list empty">{t.noAdsFound}</div>;
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
