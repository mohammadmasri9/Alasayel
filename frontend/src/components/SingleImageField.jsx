import { useEffect, useMemo, useRef, useState } from 'react'
import { IMAGE_TYPES, MAX_IMAGE_MB } from '../utils/horse'

// One replaceable image (logo, hero photo, banner…).
//   current: { url, isDefault } as saved on the server
//   file:    newly chosen File (not uploaded yet) or null
//   reset:   true if the admin chose "restore default"
export default function SingleImageField({ label, hint, current, file, reset, onChange, error, aspect = 'aspect-video', fit = 'object-cover' }) {
  const inputRef = useRef(null)
  const [localError, setLocalError] = useState('')
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])
  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview])

  // What visitors will see after saving.
  const shownUrl = preview || (reset ? current.defaultUrl : current.url)
  const willBeDefault = !file && (reset || current.isDefault)

  function pick(e) {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    if (!IMAGE_TYPES.includes(f.type)) return setLocalError('نوع غير مدعوم (JPG, PNG, WEBP فقط)')
    if (f.size > MAX_IMAGE_MB * 1024 * 1024) return setLocalError(`الحجم أكبر من ${MAX_IMAGE_MB} ميغابايت`)
    setLocalError('')
    onChange({ file: f, reset: false })
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-bold text-gold-soft">{label}</span>
      <div className={`relative ${aspect} overflow-hidden rounded-xl border border-line bg-green-800`}>
        {shownUrl ? (
          <img src={shownUrl} alt="" className={`h-full w-full ${fit}`} />
        ) : (
          <span className="flex h-full items-center justify-center text-sm text-dim">بدون صورة</span>
        )}
        <span className="absolute top-2 right-2 rounded-full bg-black/60 px-2.5 py-0.5 text-[11px] text-cream">
          {file ? 'صورة جديدة — لم تُحفظ بعد' : willBeDefault ? 'الافتراضية' : 'مخصّصة'}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn btn--ghost btn--sm" onClick={() => inputRef.current?.click()}>
          {shownUrl ? 'تغيير الصورة' : 'رفع صورة'}
        </button>
        {!willBeDefault && (
          <button type="button" className="btn btn--sm text-muted hover:text-cream" onClick={() => onChange({ file: null, reset: true })}>
            {current.defaultUrl ? 'استعادة الافتراضية' : 'إزالة الصورة'}
          </button>
        )}
        {(file || reset) && (
          <button type="button" className="btn btn--sm text-muted hover:text-cream" onClick={() => onChange({ file: null, reset: false })}>
            تراجع
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept={IMAGE_TYPES.join(',')} hidden onChange={pick} />
      <span className={`text-xs ${localError || error ? 'text-red-300' : 'text-dim'}`}>
        {localError || error || hint || `JPG أو PNG أو WEBP، حتى ${MAX_IMAGE_MB} ميغابايت`}
      </span>
    </div>
  )
}
