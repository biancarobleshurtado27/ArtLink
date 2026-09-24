import { LoaderCircle } from 'lucide-react'

export default function Button({ children, variant = 'primary', loading = false, className = '', ...props }) {
  return (
    <button className={`button button-${variant} ${className}`.trim()} disabled={loading || props.disabled} {...props}>
      {loading && <LoaderCircle className="spin" size={17} aria-hidden="true" />}
      {children}
    </button>
  )
}
