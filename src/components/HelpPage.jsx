export default function HelpPage({ t }) {
  return (
    <div className="container">
      <section className="section">
        <h2>{t.helpTitle}</h2>
        <p>{t.helpDescription}</p>
      </section>
      <section className="section">
        <h3>{t.faqTitle}</h3>
        <div className="faq-item">
          <strong>{t.faq1}</strong>
          <p>{t.faq1Answer}</p>
        </div>
        <div className="faq-item">
          <strong>{t.faq2}</strong>
          <p>{t.faq2Answer}</p>
        </div>
      </section>
    </div>
  );
}
