import CtaBand from '../components/CtaBand'
import Media from '../components/Media'
import PageHead from '../components/PageHead'
import Reveal from '../components/Reveal'
import { facilities, future, offerings } from '../data/site'

export default function About() {
  return (
    <>
      <PageHead
        title="عن النادي"
        text="في قلب مدينة أريحا، يبرز مركز الأصايل للفروسية كوجهة متخصصة لرياضة الفروسية، تجمع بين شغف الخيل، التدريب، المنافسة، والفعاليات الرياضية."
      />

      {/* نبذة */}
      <section className="section">
        <div className="container split">
          <Reveal className="split__text">
            <p className="eyebrow">نبذة عن المركز</p>
            <h2 className="section-title">
              شغفٌ بالخيل… <span className="accent">أصالةٌ تُصنع في الميدان</span>
            </h2>
            <p className="section-lead">
              من خلال ميدان ومرافق المركز، نعمل على توفير بيئة مناسبة للفرسان ومحبي
              الخيل، واستضافة الفعاليات والبطولات التي تجمع نخبة من الفرسان والخيول من
              مختلف المناطق.
            </p>
            <p className="section-lead" style={{ marginBlockStart: '1rem' }}>
              استضاف المركز على مدار السنوات الماضية العديد من البطولات والفعاليات، من
              بينها بطولات ودوريات لقفز الحواجز وسباقات للخيول العربية الأصيلة، كما
              احتضن منافسات دولية لقفز الحواجز بإشراف الاتحاد الدولي للفروسية.
            </p>
          </Reveal>

          <Reveal delay={120} className="split__media">
            <Media
              src="/public/PresentingLogo2.png"
              alt="مدخل مركز الأصايل للفروسية"
              ratio="4-3"
              glyph="🏛️"
              label="صورة من المركز"
            />
          </Reveal>
        </div>
      </section>

      {/* الرؤية والرسالة */}
      <section className="section section--alt">
        <div className="container">
          <Reveal className="section-head section-head--center">
            <p className="eyebrow">من نحن</p>
            <h2 className="section-title">
              رؤيتنا <span className="accent">ورسالتنا</span>
            </h2>
          </Reveal>

          <div className="grid grid-2">
            <Reveal>
              <div className="pillar">
                <h3 className="pillar__label">رؤيتنا</h3>
                <p>
                  أن يكون مركز الأصايل للفروسية من أبرز وجهات الفروسية في فلسطين، وأن
                  نساهم في بناء جيل جديد من الفرسان، وتطوير رياضة الفروسية، وتعزيز حضور
                  الخيل العربية الأصيلة في المشهد الرياضي والثقافي.
                </p>
              </div>
            </Reveal>

            <Reveal delay={100}>
              <div className="pillar">
                <h3 className="pillar__label">رسالتنا</h3>
                <p>
                  تقديم تجربة فروسية متكاملة تجمع بين التدريب الاحترافي، رعاية الخيل،
                  تنظيم البطولات والفعاليات، واكتشاف المواهب وتطويرها، مع الحفاظ على قيم
                  الأصالة والاحتراف والروح الرياضية.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* الخدمات */}
      <section className="section">
        <div className="container">
          <Reveal className="section-head section-head--center">
            <p className="eyebrow">خدماتنا</p>
            <h2 className="section-title">
              ماذا <span className="accent">نقدّم؟</span>
            </h2>
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

      {/* المرافق */}
      <section className="section section--alt">
        <div className="container split split--reverse">
          <Reveal className="split__text">
            <p className="eyebrow">المرافق</p>
            <h2 className="section-title">
              بيئة مجهّزة <span className="accent">للفارس والخيل</span>
            </h2>
            <p className="section-lead">
              مرافق مصممة لخدمة التدريب اليومي واستضافة المنافسات، مع مساحات مخصصة
              للزوار والعائلات.
            </p>
            <ul className="check-list">
              {facilities.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={120} className="split__media">
            <Media
              src="/public/SwimerHourse.png"
              alt="مرافق المركز"
              ratio="4-3"
              glyph="🏇"
              label="صورة من المرافق"
            />
          </Reveal>
        </div>
      </section>

      {/* أريحا */}
      <section className="section">
        <div className="container split">
          <Reveal className="split__text">
            <p className="eyebrow">الموقع</p>
            <h2 className="section-title">
              أريحا… <span className="accent">قلب الفروسية</span>
            </h2>
            <p className="section-lead">
              اختيار أريحا كموقع للمركز يمنح الأصايل مكانة مميزة في المشهد الفروسي
              الفلسطيني، ويجعل المركز وجهة مناسبة لاستضافة البطولات والفعاليات التي
              تستقطب الفرسان والجمهور من مختلف المناطق.
            </p>
          </Reveal>

          <Reveal delay={120} className="split__media">
            <Media
              src="/public/Center.png"
              alt="ميدان المركز في أريحا"
              ratio="3-2"
              glyph="🌴"
              label="صورة من أريحا"
            />
          </Reveal>
        </div>
      </section>

      {/* رؤية المستقبل */}
      <section className="section section--alt">
        <div className="container">
          <Reveal className="section-head section-head--center">
            <p className="eyebrow">الطموح</p>
            <h2 className="section-title">
              رؤيتنا <span className="accent">للمستقبل</span>
            </h2>
            <p className="section-lead">
              نتطلع إلى تطوير المركز ليصبح وجهة فروسية متكاملة تجمع بين:
            </p>
          </Reveal>

          <div className="grid grid-4">
            {future.map((item, i) => (
              <Reveal key={item} delay={i * 60}>
                <div className="card">
                  <h3 className="card__title" style={{ marginBottom: 0 }}>
                    {item}
                  </h3>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  )
}
