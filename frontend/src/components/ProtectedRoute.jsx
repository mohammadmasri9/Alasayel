import { Link, Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Loading from './Loading'

// Wrap routes that need a logged-in user, optionally with a specific role:
//   <Route element={<ProtectedRoute roles={['admin']} />}> ...
//
// This only controls what the UI shows. Real security is enforced by the
// backend, which checks the JWT and role on every protected endpoint.
export default function ProtectedRoute({ roles, children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <Loading />

  if (!user) {
    // Remember where the user was going, so login can send them back.
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (roles && !roles.includes(user.role)) {
    return (
      <section className="notfound">
        <div className="container">
          <p className="notfound__code">٤٠٣</p>
          <h1 className="section-title">غير مصرّح لك</h1>
          <p className="section-lead" style={{ marginInline: 'auto' }}>
            ليست لديك صلاحية للوصول إلى هذه الصفحة.
          </p>
          <div className="btn-row" style={{ justifyContent: 'center', marginBlockStart: '2rem' }}>
            <Link className="btn btn--gold" to="/">
              العودة للرئيسية
            </Link>
          </div>
        </div>
      </section>
    )
  }

  return children ?? <Outlet />
}
