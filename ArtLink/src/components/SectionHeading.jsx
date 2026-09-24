export default function SectionHeading({ eyebrow, title }) {
  return (
    <>
      {eyebrow && <p>{eyebrow}</p>}
      <h1>{title}</h1>
    </>
  )
}