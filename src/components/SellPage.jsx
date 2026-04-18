import AdForm from './AdForm';

export default function SellPage({ user, authLoading, onAdAdded, t }) {
  return (
    <div className="container">
      <section className="section">
        <h2>{t.sell}</h2>
        <p>{t.addAdHeading}</p>
      </section>
      <section className="section">
        <AdForm
          onAdAdded={onAdAdded}
          user={user}
          authLoading={authLoading}
          t={t}
        />
      </section>
    </div>
  );
}
