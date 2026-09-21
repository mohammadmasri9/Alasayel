import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { nav, site } from '../data/site'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // امنع تمرير الصفحة خلف القائمة المفتوحة
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const links = nav.map((item) => (
    <NavLink
      key={item.to}
      to={item.to}
      end={item.to === '/'}
      className={({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`}
    >
      {item.label}
    </NavLink>
  ))

  return (
    <>
      <header className={`navbar ${scrolled ? 'is-scrolled' : ''}`}>
        <div className="container navbar__inner">
          <Link to="/" className="brand" aria-label={site.name}>
            <img className="brand__logo" src="/logo.png" alt="" />
            <span className="brand__text">
              <span className="brand__name">{site.name}</span>
              <span className="brand__sub">{site.nameEn}</span>
            </span>
          </Link>

          <nav className="nav-links" aria-label="القائمة الرئيسية">
            {links}
          </nav>

          <a
            className="btn btn--gold btn--sm nav-cta"
            href={site.whatsapp}
            target="_blank"
            rel="noreferrer"
          >
            احجز زيارتك
          </a>

          <button
            className={`nav-toggle ${open ? 'is-open' : ''}`}
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'إغلاق القائمة' : 'فتح القائمة'}
            aria-expanded={open}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      {/* الضغط على أي رابط داخل القائمة يغلقها */}
      <div
        className={`mobile-menu ${open ? 'is-open' : ''}`}
        onClick={() => setOpen(false)}
      >
        {links}
        <a
          className="btn btn--gold"
          href={site.whatsapp}
          target="_blank"
          rel="noreferrer"
        >
          احجز زيارتك
        </a>
      </div>
    </>
  )
}
