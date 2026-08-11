import React from 'react'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-gold text-ink hover:bg-goldLight',
  secondary: 'bg-cocoa text-cream hover:bg-bark',
  danger: 'bg-red-700 text-cream hover:bg-red-600',
  ghost: 'bg-transparent text-cocoa hover:bg-black/5'
}

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: ButtonProps): React.ReactElement {
  return (
    <button
      className={`rounded-lg px-4 py-2 font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${variantClasses[variant]} ${className}`}
      {...props}
    />
  )
}
