export default function Card({ children, className = '', as: Element = 'article' }) {
  return <Element className={`paper-card ${className}`.trim()}>{children}</Element>
}
