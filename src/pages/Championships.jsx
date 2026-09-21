import CtaBand from '../components/CtaBand'
import Media from '../components/Media'
import PageHead from '../components/PageHead'
import Reveal from '../components/Reveal'
import { championships, upcoming } from '../data/site'

export default function Championships() {
  return (
    <>
      <PageHead
        title="البطولات والمسابقات"
        text="استضافة وتنظيم البطولات والفعاليات الرياضية، بما يشمل قفز الحواجز وسباقات الخيول العربية الأصيلة وغيرها من المنافسات الفروسية."
      />

      <section className="section">
        <div className="container">
          <Reveal className="section-head section-head--center">
            <p className="eyebrow">ما ننظّمه</p>
            <h2 className="section-title">
              أنواع <span className="accent">البطولات</span>
            </h2>
          </Reveal>

          <div className="grid grid-2">
            {championships.map((c, i) => (
              <Reveal key={c.title} delay={i * 70}>
                <article className="card">
                  <span className="card__icon" aria-hidden="true">
                    {c.icon}
                  </span>
                  <h3 className="card__title">{c.title}</h3>
                  <p className="card__text">{c.text}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container split">
          <Reveal className="split__text">
            <p className="eyebrow">سجلّ المركز</p>
            <h2 className="section-title">
              منافسات محلية <span className="accent">ودولية</span>
            </h2>
            <p className="section-lead">
              استضاف المركز على مدار السنوات الماضية العديد من البطولات والفعاليات، من
              بينها بطولات ودوريات لقفز الحواجز وسباقات للخيول العربية الأصيلة، كما
              احتضن منافسات دولية لقفز الحواجز بإشراف الاتحاد الدولي للفروسية.
            </p>
            <ul className="check-list">
              <li>بطولات ودوريات لقفز الحواجز بمختلف الفئات</li>
              <li>سباقات للخيول العربية الأصيلة</li>
              <li>منافسات دولية بإشراف الاتحاد الدولي للفروسية</li>
              <li>مسابقات لجمال الخيل العربي الأصيل</li>
            </ul>
          </Reveal>

          <Reveal delay={120} className="split__media">
            <Media
              src="/public/images/Race.png"
              alt="منافسة قفز حواجز في المركز"
              ratio="4-3"
              glyph="🏆"
              label="صورة من البطولات"
            />
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal className="section-head section-head--center">
            <p className="eyebrow">التقويم</p>
            <h2 className="section-title">
              البطولات <span className="accent">القادمة</span>
            </h2>
            <p className="section-lead">
              تابع صفحاتنا على وسائل التواصل لمعرفة مواعيد الفعاليات فور الإعلان عنها.
            </p>
          </Reveal>

          <div className="grid grid-2">
            {upcoming.map((ev, i) => (
              <Reveal key={ev.title} delay={i * 70}>
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
        </div>
      </section>

      <CtaBand
        title="تريد المشاركة أو الاستفسار عن بطولة؟"
        text="تواصل معنا لمعرفة تفاصيل المشاركة والفئات والمواعيد."
      />
    </>
  )
}
