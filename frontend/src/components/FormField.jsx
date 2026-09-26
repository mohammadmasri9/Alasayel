import { useId } from 'react'

export const inputClass =
  'w-full rounded-xl border bg-white/5 px-4 py-3 font-sans text-base text-cream outline-none transition placeholder:text-dim focus:border-gold focus:bg-white/[0.07]'

// Labelled input with an inline error message.
//   <FormField label="..." name="..." />                 text input
//   <FormField as="select" ...><option/></FormField>     dropdown
//   <FormField as="textarea" rows={5} ... />             multi-line
export default function FormField({ label, error, hint, className = '', as = 'input', children, ...props }) {
  const id = useId()
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined
  const Control = as

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className="text-sm font-bold text-gold-soft">
        {label}
      </label>
      <Control
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className={`${inputClass} ${error ? 'border-red-400/60' : 'border-line'} ${as === 'textarea' ? 'min-h-32 resize-y' : ''}`}
        {...props}
      >
        {children}
      </Control>
      {error ? (
        <span id={`${id}-error`} className="text-xs text-red-300">
          {error}
        </span>
      ) : (
        hint && (
          <span id={`${id}-hint`} className="text-xs text-dim">
            {hint}
          </span>
        )
      )}
    </div>
  )
}
