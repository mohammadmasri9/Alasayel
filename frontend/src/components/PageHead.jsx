import { Link } from 'react-router-dom'

export default function PageHead({ title, text, crumb }) {
  return (
    <section className="page-head">
      <div className="container">
        <p className="page-head__crumb">
          <Link to="/">الرئيسية</Link>
          <span aria-hidden="true">/</span>
          <span>{crumb ?? title}</span>
        </p>
        <h1 className="page-head__title">{title}</h1>
        {text && <p className="page-head__text">{text}</p>}
      </div>
    </section>
  )
}
