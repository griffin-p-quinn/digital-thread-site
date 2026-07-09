import { useEffect, useRef } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Overview' },
  { to: '/briefing', label: 'Architecture' },
  { to: '/decision-engine', label: 'Decision Engine' },
  { to: '/graph', label: 'Live Graph' },
  { to: '/ops', label: 'Health & Ops' },
]

const fabricPages = [
  { href: 'fabric/index.html', label: 'Digital Fabric' },
  { href: 'fabric/teamcenter-mcp-architecture.html', label: 'TC MCP Arch' },
  { href: 'fabric/alpine-digital-thread.html', label: 'Digital Thread' },
]

export default function Layout() {
  const lightRef = useRef<HTMLDivElement>(null)
  const location = useLocation()

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      if (lightRef.current) {
        lightRef.current.style.left = e.clientX + 'px'
        lightRef.current.style.top = e.clientY + 'px'
      }
    }
    window.addEventListener('mousemove', handleMouse)
    return () => window.removeEventListener('mousemove', handleMouse)
  }, [])

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [location.pathname])

  // Scroll reveal observer
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add('visible')
        })
      },
      { threshold: 0.12 }
    )
    document.querySelectorAll('.reveal').forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [location.pathname])

  return (
    <>
      <div ref={lightRef} className="cursor-light" />

      <nav className="topnav">
        <NavLink to="/" className="topnav-brand">
          <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="6" fill="#131720" />
            <circle cx="16" cy="16" r="7" stroke="#48ce98" strokeWidth="1.2" fill="none" />
            <circle cx="16" cy="8" r="2.2" fill="#8579e5" />
            <circle cx="22.5" cy="21" r="2.2" fill="#5d9edf" />
            <circle cx="9.5" cy="21" r="2.2" fill="#edb050" />
            <line x1="16" y1="10.2" x2="16" y2="13.5" stroke="#8579e5" strokeWidth="0.8" />
            <line x1="20.8" y1="19.8" x2="18.2" y2="17.2" stroke="#5d9edf" strokeWidth="0.8" />
            <line x1="11.2" y1="19.8" x2="13.8" y2="17.2" stroke="#edb050" strokeWidth="0.8" />
          </svg>
          <span>Graph Experience</span>
          <span className="brand-dim">AGS</span>
        </NavLink>

        <div className="topnav-links">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="topnav-fabric">
          {fabricPages.map((p) => (
            <a key={p.href} href={p.href} className="fabric-link" target="_self">
              {p.label}
            </a>
          ))}
        </div>

        <div className="topnav-status">
          <div className="status-dot" />
          <span className="status-label">System Live</span>
        </div>
      </nav>

      <main className="page-shell">
        <Outlet />
      </main>

      <footer className="site-footer">
        <span>Teamcenter Graph Experience — Internal Demo</span>
        <span>Siemens Digital Industries Software</span>
      </footer>
    </>
  )
}
