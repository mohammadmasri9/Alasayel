import { useEffect, useMemo, useRef, useState } from 'react'
import { IMAGE_TYPES, MAX_IMAGE_MB, MAX_IMAGES } from '../utils/horse'

// Pick several images, preview them, and remove any before saving.
//   existing: [{ url, publicId }] already saved on the server (edit mode)
//   files:    [File] newly chosen, not uploaded yet
// The first image overall is used as the cover photo.
// For a single cover image pass max={1}.
export default function ImagePicker({
  existing = [],
  files = [],
  onExistingChange,
  onFilesChange,
  error,
  max = MAX_IMAGES,
  label = 'الصور',
  hint,
}) {
  const inputRef = useRef(null)
  const [localError, setLocalError] = useState('')
  const total = existing.length + files.length

  // Object URLs for previews; revoked when the files change or on unmount.
  const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files])
  useEffect(() => () => previews.forEach((url) => URL.revokeObjectURL(url)), [previews])

  function addFiles(list) {
    setLocalError('')
    const chosen = Array.from(list)
    const valid = []
    for (const file of chosen) {
      if (!IMAGE_TYPES.includes(file.type)) {
        setLocalError(`"${file.name}": نوع غير مدعوم (JPG, PNG, WEBP فقط)`)
      } else if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
        setLocalError(`"${file.name}": الحجم أكبر من ${MAX_IMAGE_MB} ميغابايت`)
      } else valid.push(file)
    }
    const room = max - total
    if (valid.length > room) setLocalError(max === 1 ? 'صورة واحدة فقط' : `الحد الأقصى ${max} صور`)
    if (room > 0) onFilesChange([...files, ...valid.slice(0, room)])
  }

  const tile = 'relative aspect-square overflow-hidden rounded-xl border border-line bg-green-800'
  const removeBtn =
    'absolute top-1.5 left-1.5 flex size-7 items-center justify-center rounded-full bg-black/70 text-sm text-cream transition hover:bg-red-600'
  const coverTag = (
    <span className="absolute right-1.5 bottom-1.5 rounded-full bg-gold px-2 text-[11px] font-bold text-green-950">
      الغلاف
    </span>
  )

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-bold text-gold-soft">
        {label} {max > 1 && `(${total}/${max})`}
      </span>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {existing.map((img, i) => (
          <div key={img.publicId} className={tile}>
            <img src={img.url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              className={removeBtn}
              aria-label="حذف الصورة"
              onClick={() => onExistingChange(existing.filter((x) => x.publicId !== img.publicId))}
            >
              ✕
            </button>
            {max > 1 && i === 0 && coverTag}
          </div>
        ))}
        {files.map((file, i) => (
          <div key={previews[i]} className={tile}>
            <img src={previews[i]} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              className={removeBtn}
              aria-label="حذف الصورة"
              onClick={() => onFilesChange(files.filter((f) => f !== file))}
            >
              ✕
            </button>
            {max > 1 && existing.length === 0 && i === 0 && coverTag}
          </div>
        ))}
        {total < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-line text-muted transition hover:border-gold hover:text-gold"
          >
            <span className="text-3xl leading-none">+</span>
            <span className="text-xs">{max > 1 ? 'إضافة صور' : 'إضافة صورة'}</span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={IMAGE_TYPES.join(',')}
        multiple={max > 1}
        hidden
        onChange={(e) => {
          addFiles(e.target.files)
          e.target.value = '' // allow picking the same file again
        }}
      />
      <span className={`text-xs ${localError || error ? 'text-red-300' : 'text-dim'}`}>
        {localError || error || hint || `JPG أو PNG أو WEBP، حتى ${MAX_IMAGE_MB} ميغابايت للصورة. الصورة الأولى هي صورة الغلاف.`}
      </span>
    </div>
  )
}
