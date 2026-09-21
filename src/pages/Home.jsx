import { Link } from 'react-router-dom'
import CtaBand from '../components/CtaBand'
import Media from '../components/Media'
import Reveal from '../components/Reveal'
import { offerings, site, stats, upcoming } from '../data/site'

export default function Home() {
  return (
    <>
      {/* القسم الرئيسي */}
      <section className="hero">
        <div className="hero__bg" />
        <div className="container hero__inner">
          <div className="hero__content">
            <Reveal>
              <span className="hero__badge">
                <span className="dot" />
                {site.city}
              </span>
            </Reveal>

            <Reveal delay={80}>
              <h1 className="hero__title">
                مركز الأصايل
                <span className="gold">للفروسية</span>
              </h1>
            </Reveal>

            <Reveal delay={160}>
              <p className="hero__tagline">{site.tagline}</p>
            </Reveal>

            <Reveal delay={220}>
              <p className="hero__text">
                وجهة متخصصة لرياضة الفروسية تجمع بين شغف الخيل، التدريب، المنافسة،
                والفعاليات الرياضية، في بيئة تهدف إلى تطوير الفارس والارتقاء بمستوى
                الفروسية.
              </p>
            </Reveal>

            <Reveal delay={280}>
              <div className="btn-row">
                <Link className="btn btn--gold" to="/about">
                  تعرف على النادي
                </Link>
                <Link className="btn btn--ghost" to="/championships">
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
              src="public\PortraitLogoPresenting.png"
              alt="خيل عربي أصيل في ميدان مركز الأصايل"
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
              الأصايل… أكثر من مجرد <span className="accent">مركز للفروسية</span>
            </h2>
            <p className="section-lead">
              نحن نؤمن بأن الفروسية ليست مجرد رياضة، بل هي علاقة تجمع الإنسان بالخيل،
              وتعلّم الفارس الانضباط، التركيز، المسؤولية، والثقة.
            </p>
            <p className="section-lead" style={{ marginBlockStart: '1rem' }}>
              ومن هنا، نسعى إلى بناء مجتمع فروسية حقيقي يجمع الفرسان والمدربين ومربي
              الخيل ومحبي هذه الرياضة، ويمنح المواهب الشابة فرصة للتعلم والتطور والوصول
              إلى المنافسات المحلية والدولية.
            </p>
            <div className="btn-row" style={{ marginBlockStart: '2rem' }}>
              <Link className="btn btn--gold" to="/about">
                المزيد عن النادي
              </Link>
            </div>
          </Reveal>

          <Reveal delay={120} className="split__media">
            <Media
              src="public/HomePic.png"
              alt="فرسان في ميدان المركز"
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

          <div className="grid grid-3">
            {upcoming.map((ev, i) => (
              <Reveal key={ev.title} delay={i * 80}>
                <article className="event-card">
                  <div className="event-card__date">
                    <span className="big">{ev.date}</span>
                    <span className="tag">{ev.tag}</span>
                  </div>
                  <div className="event-card__body">
                    <h3 className="event-card__title">{ev.title}</h3>
                    <p className="event-card__meta">
                      <span>📍 {ev.place}</span>
                    </p>
                    <p className="event-card__text">{ev.text}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <div className="btn-row" style={{ justifyContent: 'center', marginBlockStart: '2.5rem' }}>
              <Link className="btn btn--ghost" to="/championships">
                كل البطولات والمسابقات
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <CtaBand />
    </>
  )
}
