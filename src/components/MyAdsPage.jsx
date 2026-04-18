import AdList from './AdList';

export default function MyAdsPage({ ads, loading, error, user, onDelete, t }) {
  return (
    <div className="container">
      <section className="section">
        <h2>{t.myAds}</h2>
        <AdList
          ads={ads}
          loading={loading}
          error={error}
          onDelete={onDelete}
          currentUser={user}
          isAdmin={false}
          t={t}
        />
      </section>
    </div>
  );
}