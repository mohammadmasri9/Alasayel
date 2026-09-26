import { Link } from 'react-router-dom'
import CtaBand from '../components/CtaBand'
import Media from '../components/Media'
import Reveal from '../components/Reveal'
import UpcomingEvents from '../components/UpcomingEvents'
import { offerings, stats } from '../data/site'
import { useSettings } from '../hooks/useSettings'

// Hero and "about" texts/images come from Website Settings (admin).
export default function Home() {
  const { settings: site } = useSettings()

  return (
    <>
      {/* القسم الرئيسي */}
      <section className="hero">
        <div className="hero__bg" />
        <div className="container hero__inner">
          <div className="hero__content">
            {site.heroBadge && (
              <Reveal>
                <span className="hero__badge">
                  <span className="dot" />
                  {site.heroBadge}
                </span>
              </Reveal>
            )}

            <Reveal delay={80}>
              <h1 className="hero__title">
                {site.heroTitle}
                {site.heroTitleHighlight && <span className="gold">{site.heroTitleHighlight}</span>}
              </h1>
            </Reveal>

            {site.tagline && (
              <Reveal delay={160}>
                <p className="hero__tagline">{site.tagline}</p>
              </Reveal>
            )}

            {site.heroDescription && (
              <Reveal delay={220}>
                <p className="hero__text">{site.heroDescription}</p>
              </Reveal>
            )}

            <Reveal delay={280}>
              <div className="btn-row">
                <Link className="btn btn--gold" to="/about">
                  تعرف على النادي
                </Link>
                <Link className="btn btn--ghost" to="/events">
                  البطولات والفعاليات
                </Link>
                <Link className="btn btn--ghost" to="/contact">
                  تواصل معنا
                </Link>
              </div>
            </Reveal>
          </div>

          <Reveal delay={200} className="hero__visual">
            <span className="hero__ring" aria-hidden="true" />
            <Media
              src={site.heroImage.url}
              alt={`${site.heroTitle} ${site.heroTitleHighlight || ''}`.trim()}
              ratio="4-5"
              glyph="🐎"
              label="ضع صورة الخيل هنا"
            />
          </Reveal>
        </div>

        <div className="hero__scroll" aria-hidden="true">
          <span>اكتشف</span>
          <span className="line" />
        </div>
      </section>

      {/* الأرقام */}
      <section className="section section--tight">
        <div className="container">
          <Reveal>
            <div className="stats">
              {stats.map((s) => (
                <div className="stat" key={s.label}>
                  <div className="stat__value">{s.value}</div>
                  <div className="stat__label">{s.label}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* نبذة */}
      <section className="section section--alt">
        <div className="container split">
          <Reveal className="split__text">
            <p className="eyebrow">عن المركز</p>
            <h2 className="section-title">
              {site.aboutTitle} {site.aboutTitleHighlight && <span className="accent">{site.aboutTitleHighlight}</span>}
            </h2>
            {site.aboutParagraphs.map((text, i) => (
              <p key={i} className="section-lead" style={i > 0 ? { marginBlockStart: '1rem' } : undefined}>
                {text}
              </p>
            ))}
            <div className="btn-row" style={{ marginBlockStart: '2rem' }}>
              <Link className="btn btn--gold" to="/about">
                المزيد عن النادي
              </Link>
            </div>
          </Reveal>

          <Reveal delay={120} className="split__media">
            <Media
              src={site.aboutImage.url}
              alt={site.aboutTitleHighlight || site.aboutTitle}
              ratio="4-3"
              glyph="🏇"
              label="صورة من الميدان"
            />
          </Reveal>
        </div>
      </section>

      {/* ماذا نقدم */}
      <section className="section">
        <div className="container">
          <Reveal className="section-head section-head--center">
            <p className="eyebrow">خدماتنا</p>
            <h2 className="section-title">
              ماذا <span className="accent">نقدّم؟</span>
            </h2>
            <p className="section-lead">
              تجربة فروسية متكاملة تجمع بين التدريب الاحترافي، رعاية الخيل، تنظيم
              البطولات والفعاليات، واكتشاف المواهب وتطويرها.
            </p>
          </Reveal>

          <div className="grid grid-3">
            {offerings.map((item, i) => (
              <Reveal key={item.title} delay={i * 70}>
                <article className="card">
                  <span className="card__icon" aria-hidden="true">
                    {item.icon}
                  </span>
                  <h3 className="card__title">{item.title}</h3>
                  <p className="card__text">{item.text}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* القادم من البطولات */}
      <section className="section section--alt">
        <div className="container">
          <Reveal className="section-head section-head--center">
            <p className="eyebrow">تقويم المركز</p>
            <h2 className="section-title">
              البطولات <span className="accent">القادمة</span>
            </h2>
            <p className="section-lead">
              منافسات وفعاليات تجمع نخبة من الفرسان والخيول من مختلف المناطق.
            </p>
          </Reveal>

          <UpcomingEvents limit={3} />

          <Reveal>
            <div className="btn-row" style={{ justifyContent: 'center', marginBlockStart: '2.5rem' }}>
              <Link className="btn btn--ghost" to="/championships">
                كل الفعاليات والبطولات
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <CtaBand />
    </>
  )
}
