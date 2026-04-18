export default function AboutPage({ t }) {
  return (
    <div className="container">
      <section className="section">
        <h2>{t.aboutTitle}</h2>
        <p>{t.aboutDescription}</p>
      </section>
    </div>
  );
}
