import { Link } from 'react-router-dom'
import { nav } from '../data/site'
import { useSettings } from '../hooks/useSettings'
import SocialLinks from './SocialLinks'

export default function Footer() {
  const { settings: s } = useSettings()

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div className="footer__brand">
            <Link to="/" className="brand">
              <img className="brand__logo" src={s.logo.url} alt="" />
              <span className="brand__text">
                <span className="brand__name">{s.siteName}</span>
                {s.siteNameEn && <span className="brand__sub">{s.siteNameEn}</span>}
              </span>
            </Link>
            {s.footerAbout && <p className="footer__about">{s.footerAbout}</p>}
            <SocialLinks />
          </div>

          <div>
            <h3 className="footer__title">روابط سريعة</h3>
            <ul className="footer__list">
              {nav.map((item) => (
                <li key={item.to}>
                  <Link to={item.to}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="footer__title">تواصل معنا</h3>
            <ul className="footer__list">
              {s.phoneHref && (
                <li>
                  <a href={s.phoneHref}>
                    <span aria-hidden="true">📞</span>
                    <span dir="ltr">{s.contactPhone}</span>
                  </a>
                </li>
              )}
              {s.whatsappUrl && (
                <li>
                  <a href={s.whatsappUrl} target="_blank" rel="noreferrer">
                    <span aria-hidden="true">💬</span> واتساب
                  </a>
                </li>
              )}
              {s.contactEmail && (
                <li>
                  <a href={`mailto:${s.contactEmail}`}>
                    <span aria-hidden="true">✉️</span>
                    <span dir="ltr">{s.contactEmail}</span>
                  </a>
                </li>
              )}
              {s.address && (
                <li>
                  <a href={s.mapLinkUrl || undefined} target="_blank" rel="noreferrer">
                    <span aria-hidden="true">📍</span> {s.address}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <span>
            © {new Date().getFullYear()} {s.siteName} — جميع الحقوق محفوظة
          </span>
          {s.slogan && <span className="footer__slogan">{s.slogan}</span>}
        </div>
      </div>
    </footer>
  )
}
