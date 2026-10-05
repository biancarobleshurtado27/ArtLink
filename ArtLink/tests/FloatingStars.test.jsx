import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import FloatingStars, { SparkleStar, HERO_SPARKLES_DATA, HEADER_SPARKLES_DATA } from '../src/components/FloatingStars'

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
