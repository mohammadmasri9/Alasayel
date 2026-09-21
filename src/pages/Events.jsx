import CtaBand from '../components/CtaBand'
import Media from '../components/Media'
import PageHead from '../components/PageHead'
import Reveal from '../components/Reveal'
import { events } from '../data/site'

export default function Events() {
  return (
    <>
      <PageHead
        title="الفعاليات"
        text="فعاليات وأنشطة تجمع الفرسان والعائلات ومحبي الخيل، في أجواء تجمع بين الرياضة والترفيه."
      />

      <section className="section">
        <div className="container">
          <Reveal className="section-head section-head--center">
            <p className="eyebrow">أنشطتنا</p>
            <h2 className="section-title">
              فعاليات <span className="accent">المركز</span>
            </h2>
            <p className="section-lead">
              نهدف إلى جعل الفروسية تجربة تجمع أفراد العائلة، من الأطفال والفرسان إلى
              محبي الخيل والزوار.
            </p>
          </Reveal>

          <div className="grid grid-3">
            {events.map((ev, i) => (
              <Reveal key={ev.title} delay={i * 70}>
                <article className="card">
                  <span className="card__icon" aria-hidden="true">
                    {ev.icon}
                  </span>
                  <h3 className="card__title">{ev.title}</h3>
                  <p className="card__text">{ev.text}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container split split--reverse">
          <Reveal className="split__text">
            <p className="eyebrow">للأطفال والناشئين</p>
            <h2 className="section-title">
              المخيمات <span className="accent">الصيفية</span>
            </h2>
            <p className="section-lead">
              برنامج صيفي يعرّف الأطفال على الخيل والفروسية ضمن أجواء آمنة وممتعة، ويبني
              لديهم الثقة والانضباط والمسؤولية.
            </p>
            <ul className="check-list">
              <li>تعريف بالخيل وطريقة التعامل معه</li>
              <li>أساسيات الركوب تحت إشراف مباشر</li>
              <li>العناية بالخيل وتجهيزه</li>
              <li>أنشطة جماعية ومسابقات ودية</li>
            </ul>
          </Reveal>

          <Reveal delay={120} className="split__media">
            <Media
              src="/public/images/Children.png"
              alt="مخيم صيفي للأطفال في المركز"
              ratio="4-3"
              glyph="🏕️"
              label="صورة من المخيم"
            />
          </Reveal>
        </div>
      </section>

      <CtaBand
        title="تخطط لفعالية خاصة؟"
        text="يستضيف المركز المناسبات والمعسكرات والأنشطة الخاصة. تواصل معنا لمناقشة التفاصيل."
      />
    </>
  )
}
