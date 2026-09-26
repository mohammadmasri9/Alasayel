import PageHead from '../components/PageHead'
import Reveal from '../components/Reveal'
import { FacebookIcon, InstagramIcon, TiktokIcon } from '../components/Icons'
import { mapsDirections, mapsEmbed, site } from '../data/site'

export default function Contact() {
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
              <a className="contact-card" href={`tel:${site.phone}`}>
                <span className="contact-card__icon" aria-hidden="true">
                  📞
                </span>
                <span className="contact-card__label">الهاتف</span>
                <span className="contact-card__value">{site.phoneDisplay}</span>
              </a>
            </Reveal>

            <Reveal delay={70}>
              <a
                className="contact-card"
                href={site.whatsapp}
                target="_blank"
                rel="noreferrer"
              >
                <span className="contact-card__icon" aria-hidden="true">
                  💬
                </span>
                <span className="contact-card__label">واتساب</span>
                <span className="contact-card__value">{site.phoneDisplay}</span>
              </a>
            </Reveal>

            <Reveal delay={140}>
              <a className="contact-card" href={`mailto:${site.email}`}>
                <span className="contact-card__icon" aria-hidden="true">
                  ✉️
                </span>
                <span className="contact-card__label">البريد الإلكتروني</span>
                <span className="contact-card__value">{site.email}</span>
              </a>
            </Reveal>

            <Reveal delay={210}>
              <a
                className="contact-card"
                href={mapsDirections}
                target="_blank"
                rel="noreferrer"
              >
                <span className="contact-card__icon" aria-hidden="true">
                  📍
                </span>
                <span className="contact-card__label">الموقع</span>
                <span className="contact-card__value contact-card__value--rtl">
                  {site.city}
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
              {site.hours.map((h) => (
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
              <div className="socials">
                <a
                  className="social-btn"
                  href={site.social.facebook}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="فيسبوك"
                >
                  <FacebookIcon />
                </a>
                <a
                  className="social-btn"
                  href={site.social.instagram}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="إنستغرام"
                >
                  <InstagramIcon />
                </a>
                <a
                  className="social-btn"
                  href={site.social.tiktok}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="تيك توك"
                >
                  <TiktokIcon />
                </a>
              </div>
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
            <p className="section-lead">{site.city}</p>
          </Reveal>

<Reveal>
  <div className="map-frame">
    <iframe
      src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d847.3344304601623!2d35.47212753928004!3d31.84302404046551!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2s!4v1789972156732!5m2!1sen!2s"
      title="موقع مركز الأصايل للفروسية على الخريطة"
      width="600"
      height="450"
      style={{ border: "0" }}
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
                href={mapsDirections}
                target="_blank"
                rel="noreferrer"
              >
                احصل على الاتجاهات
              </a>
              <a
                className="btn btn--ghost"
                href={site.whatsapp}
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
