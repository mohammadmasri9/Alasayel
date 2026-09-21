import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <section className="notfound">
      <div className="container">
        <p className="notfound__code">٤٠٤</p>
        <h1 className="section-title">الصفحة غير موجودة</h1>
        <p className="section-lead" style={{ marginInline: 'auto' }}>
          يبدو أن الرابط الذي تبحث عنه غير متاح. يمكنك العودة إلى الصفحة الرئيسية.
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
