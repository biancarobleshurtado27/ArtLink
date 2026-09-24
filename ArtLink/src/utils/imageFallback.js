const placeholderSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="420" height="420"><rect width="420" height="420" fill="#F3EEFF"/><rect width="420" height="420" fill="none" stroke="#1E192B" stroke-width="6"/><circle cx="210" cy="170" r="70" fill="#DDD0FF" stroke="#1E192B" stroke-width="6"/><path d="M150 260q30-45 60 0M210 260q30-45 60 0" fill="none" stroke="#1E192B" stroke-width="6" stroke-linecap="round"/><rect x="130" y="330" width="160" height="26" rx="13" fill="#FEF08A" stroke="#1E192B" stroke-width="5"/></svg>'

export const imagePlaceholder = `data:image/svg+xml;utf8,${encodeURIComponent(placeholderSvg)}`

export function handleImageError(event) {
  const image = event.currentTarget
  if (image.src !== imagePlaceholder) image.src = imagePlaceholder
}