import { Link } from 'react-router-dom'
import { useSettings } from '../hooks/useSettings'
import Reveal from './Reveal'

export default function CtaBand({
  title = 'جاهز لتبدأ رحلتك مع الخيل؟',
  text = 'تواصل معنا لمعرفة المزيد عن برامج التدريب، أو لحجز زيارة إلى المركز والتعرف على الميدان والخيول عن قرب.',
}) {
  const { settings } = useSettings()

  return (
    <section className="section section--tight">
      <div className="container">
        <Reveal>
          <div className="cta-band">
            <h2 className="cta-band__title">{title}</h2>
            <p className="cta-band__text">{text}</p>
            <div className="btn-row">
              {settings.whatsappUrl && (
                <a className="btn btn--gold" href={settings.whatsappUrl} target="_blank" rel="noreferrer">
                  تواصل عبر واتساب
                </a>
              )}
              <Link className="btn btn--ghost" to="/contact">
                صفحة التواصل
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
