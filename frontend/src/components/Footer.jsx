import { Link } from 'react-router-dom'
import { mapsDirections, nav, site } from '../data/site'
import { FacebookIcon, InstagramIcon, TiktokIcon } from './Icons'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div className="footer__brand">
            <Link to="/" className="brand">
              <img className="brand__logo" src="/logo.png" alt="" />
              <span className="brand__text">
                <span className="brand__name">{site.name}</span>
                <span className="brand__sub">{site.nameEn}</span>
              </span>
            </Link>
            <p className="footer__about">
              وجهة متخصصة لرياضة الفروسية في قلب مدينة أريحا، تجمع بين شغف الخيل،
              التدريب، المنافسة، والفعاليات الرياضية.
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
              <li>
                <a href={`tel:${site.phone}`}>
                  <span aria-hidden="true">📞</span>
                  <span dir="ltr">{site.phoneDisplay}</span>
                </a>
              </li>
              <li>
                <a href={site.whatsapp} target="_blank" rel="noreferrer">
                  <span aria-hidden="true">💬</span> واتساب
                </a>
              </li>
              <li>
                <a href={`mailto:${site.email}`}>
                  <span aria-hidden="true">✉️</span>
                  <span dir="ltr">{site.email}</span>
                </a>
              </li>
              <li>
                <a href={mapsDirections} target="_blank" rel="noreferrer">
                  <span aria-hidden="true">📍</span> {site.city}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <span>
            © {new Date().getFullYear()} {site.name} — جميع الحقوق محفوظة
          </span>
          <span className="footer__slogan">{site.slogan}</span>
        </div>
      </div>
    </footer>
  )
}
