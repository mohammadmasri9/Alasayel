import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { nav } from '../data/site'
import { useAuth } from '../hooks/useAuth'
import { useLogout } from '../hooks/useLogout'
import { useSettings } from '../hooks/useSettings'
import { LogoutIcon } from './Icons'

export default function Navbar() {
  const { user, isAdmin } = useAuth()
  const logout = useLogout()
  const { settings } = useSettings()
  const account = user
    ? { to: isAdmin ? '/admin' : '/profile', label: isAdmin ? 'لوحة التحكم' : 'حسابي' }
    : { to: '/login', label: 'دخول' }
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
          <Link to="/" className="brand" aria-label={settings.siteName}>
            <img className="brand__logo" src={settings.logo.url} alt="" />
            <span className="brand__text">
              <span className="brand__name">{settings.siteName}</span>
              {settings.siteNameEn && <span className="brand__sub">{settings.siteNameEn}</span>}
            </span>
          </Link>

          <nav className="nav-links" aria-label="القائمة الرئيسية">
            {links}
          </nav>

          <div className="nav-account nav-cta">
            <Link className="btn btn--ghost btn--sm" to={account.to}>
              {account.label}
            </Link>
            {user && (
              <button
                type="button"
                className="btn btn--ghost btn--sm px-3!"
                onClick={logout}
                aria-label="تسجيل الخروج"
                title="تسجيل الخروج"
              >
                <LogoutIcon />
              </button>
            )}
          </div>

          <a
            className="btn btn--gold btn--sm nav-cta"
            href={settings.whatsappUrl || '/contact'}
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
        <Link className="btn btn--ghost" to={account.to}>
          {account.label}
        </Link>
        {user && (
          <button type="button" className="btn btn--ghost" onClick={logout}>
            <LogoutIcon /> تسجيل الخروج
          </button>
        )}
        <a
          className="btn btn--gold"
          href={settings.whatsappUrl || '/contact'}
          target="_blank"
          rel="noreferrer"
        >
          احجز زيارتك
        </a>
      </div>
    </>
  )
}
