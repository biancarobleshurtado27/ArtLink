export default function Badge({ children, tone = 'violet' }) {
  return <span className={`badge badge-${tone}`}>{children}</span>
}
