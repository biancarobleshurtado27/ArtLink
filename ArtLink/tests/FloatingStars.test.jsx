import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import FloatingStars, {
  SparkleStar,
  HERO_SPARKLES_DATA,
  HEADER_SPARKLES_DATA,
  PAGE_SPARKLES_DATA,
  SUBTLE_SPARKLES_DATA,
  DecorativeStars,
  AnimatedStars,
  BackgroundDecoration,
  HeroDecoration,
  DecorativeStar,
} from '../src/components/FloatingStars'

describe('FloatingStars Component', () => {
  it('renders SparkleStar SVG with correct attributes and without emojis', () => {
    const { container } = render(<SparkleStar size={32} color="#F472B6" />)
    const svg = container.querySelector('svg')
    expect(svg).toBeTruthy()
    expect(svg.getAttribute('width')).toBe('32')
    expect(svg.getAttribute('height')).toBe('32')
    const path = svg.querySelector('path')
    expect(path).toBeTruthy()
    expect(path.getAttribute('fill')).toBe('#F472B6')
  })

  it('renders hero variant with all stars from HERO_SPARKLES_DATA', () => {
    const { container } = render(<FloatingStars variant="hero" />)
    const stars = container.querySelectorAll('.hero-floating-star')
    expect(stars.length).toBe(HERO_SPARKLES_DATA.length)
  })

  it('renders header variant with the designated count and classes', () => {
    const { container } = render(<FloatingStars variant="header" />)
    const stars = container.querySelectorAll('.hero-floating-star')
    expect(stars.length).toBe(HEADER_SPARKLES_DATA.length)
    expect(container.querySelector('.floating-stars-container')).toBeTruthy()
  })

  it('renders page variant with bleed class and PAGE_SPARKLES_DATA', () => {
    const { container } = render(<FloatingStars variant="page" />)
    const stars = container.querySelectorAll('.hero-floating-star')
    expect(stars.length).toBe(PAGE_SPARKLES_DATA.length)
    expect(container.querySelector('.floating-stars-container--bleed')).toBeTruthy()
  })

  it('renders subtle variant with SUBTLE_SPARKLES_DATA', () => {
    const { container } = render(<FloatingStars variant="subtle" />)
    const stars = container.querySelectorAll('.hero-floating-star')
    expect(stars.length).toBe(SUBTLE_SPARKLES_DATA.length)
  })

  it('exposes compatible aliases for reusable decoration system', () => {
    expect(DecorativeStars).toBe(FloatingStars)
    expect(AnimatedStars).toBe(FloatingStars)
    expect(BackgroundDecoration).toBe(FloatingStars)
    expect(HeroDecoration).toBe(FloatingStars)
    expect(DecorativeStar).toBe(SparkleStar)
  })

  it('renders custom star configurations passed as props', () => {
    const customStars = [
      { id: 'c1', top: '10px', left: '10px', size: 20, color: '#FEF08A' },
      { id: 'c2', top: '50px', right: '20px', size: 18, color: '#2DD4BF' },
    ]
    const { container } = render(<FloatingStars stars={customStars} />)
    const stars = container.querySelectorAll('.hero-floating-star')
    expect(stars.length).toBe(2)
  })
})
