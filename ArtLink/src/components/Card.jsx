export default function Card({
  children,
  className = '',
  tape = false,
  sticker = false,
  as: Element = 'article',
}) {
  const decor = `${tape ? ' paper-card--tape' : ''}${sticker ? ' paper-card--sticker' : ''}`
  return <Element className={`paper-card${decor} ${className}`.trim()}>{children}</Element>
}