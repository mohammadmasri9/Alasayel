import PageHead from '../components/PageHead'
import Reveal from '../components/Reveal'
import SocialLinks from '../components/SocialLinks'
import { useSettings } from '../hooks/useSettings'

export default function Contact() {
  const { settings: site } = useSettings()

  return (
    <>
      <PageHead
        title="تواصل معنا"
        text="يسعدنا استقبال استفساراتكم وزياراتكم. تواصلوا معنا عبر الهاتف أو واتساب أو البريد الإلكتروني."
      />

      {/* بطاقات التواصل */}
      <section className="section">
        <div className="container">
          <div className="contact-grid">
            <Reveal>
              <a className="contact-card" href={site.phoneHref}>
                <span className="contact-card__icon" aria-hidden="true">
                  📞
                </span>
                <span className="contact-card__label">الهاتف</span>
                <span className="contact-card__value">{site.contactPhone}</span>
              </a>
            </Reveal>

            <Reveal delay={70}>
              <a
                className="contact-card"
                href={site.whatsappUrl}
                target="_blank"
                rel="noreferrer"
              >
                <span className="contact-card__icon" aria-hidden="true">
                  💬
                </span>
                <span className="contact-card__label">واتساب</span>
                <span className="contact-card__value">{site.contactPhone}</span>
              </a>
            </Reveal>

            <Reveal delay={140}>
              <a className="contact-card" href={`mailto:${site.contactEmail}`}>
                <span className="contact-card__icon" aria-hidden="true">
                  ✉️
                </span>
                <span className="contact-card__label">البريد الإلكتروني</span>
                <span className="contact-card__value">{site.contactEmail}</span>
              </a>
            </Reveal>

            <Reveal delay={210}>
              <a
                className="contact-card"
                href={site.mapLinkUrl}
                target="_blank"
                rel="noreferrer"
              >
                <span className="contact-card__icon" aria-hidden="true">
                  📍
                </span>
                <span className="contact-card__label">الموقع</span>
                <span className="contact-card__value contact-card__value--rtl">
                  {site.address}
                </span>
              </a>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ساعات العمل + التواصل الاجتماعي */}
      <section className="section section--tight section--alt">
        <div className="container split">
          <Reveal className="split__text">
            <p className="eyebrow">ساعات العمل</p>
            <h2 className="section-title">
              مواعيد <span className="accent">الزيارة</span>
            </h2>
            <ul className="hours-list" style={{ marginBlockStart: '1.5rem' }}>
              {site.openingHours.map((h) => (
                <li key={h.day}>
                  <strong>{h.day}</strong>
                  <span>{h.time}</span>
                </li>
              ))}
            </ul>
            <p className="section-lead" style={{ marginBlockStart: '1.5rem' }}>
              ننصح بالتواصل معنا قبل الزيارة لتأكيد المواعيد، خاصة في أيام البطولات
              والفعاليات.
            </p>
          </Reveal>

          <Reveal delay={120}>
            <div className="pillar">
              <h3 className="pillar__label">تابعنا</h3>
              <p>
                تابع صفحاتنا لمعرفة آخر أخبار المركز ومواعيد البطولات والفعاليات
                والصور من الميدان.
              </p>
              <SocialLinks />
            </div>
          </Reveal>
        </div>
      </section>

      {/* الخريطة */}
      <section className="section">
        <div className="container">
          <Reveal className="section-head section-head--center">
            <p className="eyebrow">كيف تصل إلينا</p>
            <h2 className="section-title">
              موقع <span className="accent">المركز</span>
            </h2>
            <p className="section-lead">{site.address}</p>
          </Reveal>

<Reveal>
  <div className="map-frame">
    <iframe
      src={site.mapEmbedUrl}
      title="موقع مركز الأصايل للفروسية على الخريطة"
      width="600"
      height="450"
      style={{ border: '0' }}
      loading="lazy"
      referrerPolicy="strict-origin-when-cross-origin"
      allowFullScreen
    />
  </div>
</Reveal>
          

          <Reveal>
            <div
              className="btn-row"
              style={{ justifyContent: 'center', marginBlockStart: '2rem' }}
            >
              <a
                className="btn btn--gold"
                href={site.mapLinkUrl}
                target="_blank"
                rel="noreferrer"
              >
                احصل على الاتجاهات
              </a>
              <a
                className="btn btn--ghost"
                href={site.whatsappUrl}
                target="_blank"
                rel="noreferrer"
              >
                تواصل عبر واتساب
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
