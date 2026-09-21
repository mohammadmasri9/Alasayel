import CtaBand from '../components/CtaBand'
import Media from '../components/Media'
import PageHead from '../components/PageHead'
import Reveal from '../components/Reveal'
import { trainingPrograms } from '../data/site'

export default function Training() {
  return (
    <>
      <PageHead
        title="تدريب الخيل"
        text="برامج تدريبية لمختلف المستويات، من المبتدئين إلى الفرسان الراغبين في تطوير مهاراتهم والمشاركة في المنافسات."
      />

      <section className="section">
        <div className="container split">
          <Reveal className="split__text">
            <p className="eyebrow">فلسفتنا في التدريب</p>
            <h2 className="section-title">
              الفارس والخيل… <span className="accent">فريق واحد</span>
            </h2>
            <p className="section-lead">
              نبني التدريب على التدرّج والثقة: نبدأ من الأساسيات ونتقدم خطوة بخطوة حسب
              مستوى الفارس وقدرات الخيل، مع متابعة مستمرة للياقة والصحة والسلوك.
            </p>
            <p className="section-lead" style={{ marginBlockStart: '1rem' }}>
              كل برنامج يراعي الأمان أولًا، ويهدف إلى تطوير مهارة الفارس وتعزيز علاقته
              بالخيل قبل التفكير في المنافسة.
            </p>
          </Reveal>

          <Reveal delay={120} className="split__media">
            <Media
              src="/public/LandscabeTraining.png"
              alt="جلسة تدريب في ميدان المركز"
              ratio="4-3"
              glyph="🐎"
              label="صورة من التدريب"
            />
          </Reveal>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <Reveal className="section-head section-head--center">
            <p className="eyebrow">البرامج</p>
            <h2 className="section-title">
              أنواع <span className="accent">التدريب</span>
            </h2>
            <p className="section-lead">
              اختر البرنامج المناسب لك، أو تواصل معنا لنساعدك في تحديد نقطة البداية.
            </p>
          </Reveal>

          <div className="grid" style={{ gap: '1.2rem' }}>
            {trainingPrograms.map((p, i) => (
              <Reveal key={p.id} delay={i * 60}>
                <article className="program">
                  <span className="program__icon" aria-hidden="true">
                    {p.icon}
                  </span>
                  <div>
                    <div className="program__head">
                      <h3 className="program__title">{p.title}</h3>
                      <span className="tag">{p.level}</span>
                    </div>
                    <p className="program__summary">{p.summary}</p>
                    <ul className="program__details">
                      {p.details.map((d) => (
                        <li key={d}>{d}</li>
                      ))}
                    </ul>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CtaBand
        title="ابدأ برنامجك التدريبي"
        text="تواصل معنا لتحديد المستوى المناسب والانضمام إلى برامج التدريب في مركز الأصايل."
      />
    </>
  )
}
