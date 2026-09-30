import { beforeEach, describe, expect, it, vi } from 'vitest'

const { getMock, postMock, patchMock, deleteMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
  postMock: vi.fn(),
  patchMock: vi.fn(),
  deleteMock: vi.fn(),
}))

vi.mock('../src/services/apiClient', () => ({
  default: {
    get: getMock,
    post: postMock,
    patch: patchMock,
    delete: deleteMock,
  },
  getServiceError: (error) => error,
}))

import {
  getReviews,
  getReviewById,
  getReviewsByArtistId,
  createReview,
  updateReview,
  deleteReview,
} from '../src/services/reviewService'

describe('reviewService HTTP contract', () => {
  beforeEach(() => {
    getMock.mockReset()
    postMock.mockReset()
    patchMock.mockReset()
    deleteMock.mockReset()
  })

  it('obtiene el listado de reseñas con o sin parámetros', async () => {
    const mockList = [{ id: 'review-001', artistId: 'artist-001', rating: 5 }]
    getMock.mockResolvedValue({ data: mockList })

    await expect(getReviews({ artistId: 'artist-001' })).resolves.toEqual(mockList)
    expect(getMock).toHaveBeenCalledWith('/reviews', { params: { artistId: 'artist-001' } })
  })

  it('obtiene una reseña por ID', async () => {
    const mockReview = { id: 'review-001', rating: 5, comment: 'Excelente' }
    getMock.mockResolvedValue({ data: mockReview })

    await expect(getReviewById('review-001')).resolves.toEqual(mockReview)
    expect(getMock).toHaveBeenCalledWith('/reviews/review-001')
  })

  it('obtiene reseñas filtradas por artista', async () => {
    const mockList = [{ id: 'review-001', artistId: 'artist-001' }]
    getMock.mockResolvedValue({ data: mockList })

    await expect(getReviewsByArtistId('artist-001')).resolves.toEqual(mockList)
    expect(getMock).toHaveBeenCalledWith('/reviews', { params: { artistId: 'artist-001' } })
  })

  it('crea una nueva reseña', async () => {
    const newRev = { artistId: 'artist-001', clientId: 'user-client-001', rating: 5 }
    postMock.mockResolvedValue({ data: { id: 'review-new', ...newRev } })

    await expect(createReview(newRev)).resolves.toEqual({ id: 'review-new', ...newRev })
    expect(postMock).toHaveBeenCalledWith('/reviews', newRev)
  })

  it('actualiza una reseña existente', async () => {
    patchMock.mockResolvedValue({ data: { id: 'review-001', rating: 4 } })

    await expect(updateReview('review-001', { rating: 4 })).resolves.toEqual({ id: 'review-001', rating: 4 })
    expect(patchMock).toHaveBeenCalledWith('/reviews/review-001', { rating: 4 })
  })

  it('elimina una reseña por ID', async () => {
    deleteMock.mockResolvedValue({ data: {} })

    await expect(deleteReview('review-001')).resolves.toEqual({})
    expect(deleteMock).toHaveBeenCalledWith('/reviews/review-001')
  })
})
