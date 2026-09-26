import { useState } from 'react'

/**
 * صورة مع بديل أنيق إذا لم تتوفر الصورة بعد.
 * ضع الصور في مجلد public/images ثم مرّر المسار، مثال: src="/images/hero.jpg"
 */
export default function Media({
  src,
  alt = '',
  ratio = '4-3',
  glyph = '🐎',
  label = 'صورة من المركز',
  className = '',
}) {
  const [failed, setFailed] = useState(false)
  const showImage = src && !failed

  return (
    <figure className={`media media--ratio-${ratio} ${className}`}>
      {showImage ? (
        <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} />
      ) : (
        <div className="media__placeholder" aria-hidden="true">
          <span className="glyph">{glyph}</span>
          <span className="label">{label}</span>
        </div>
      )}
    </figure>
  )
}
