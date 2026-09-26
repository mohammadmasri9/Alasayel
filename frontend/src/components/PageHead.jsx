import { Link } from 'react-router-dom'

// `image` (optional): background photo behind the title, darkened so the
// text stays readable. Used for the admin-editable Events banner.
// z-[-1] matches .page-head::before, so the photo paints just above it.
export default function PageHead({ title, text, crumb, image }) {
  return (
    <section className="page-head">
      {image && (
        <>
          <img src={image} alt="" className="absolute inset-0 z-[-1] h-full w-full object-cover" />
          <span className="absolute inset-0 z-[-1] bg-gradient-to-b from-green-950/80 via-green-950/70 to-green-900" aria-hidden="true" />
        </>
      )}
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
