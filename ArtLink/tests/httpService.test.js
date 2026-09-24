import { beforeEach, describe, expect, it, vi } from 'vitest'

const { getMock } = vi.hoisted(() => ({ getMock: vi.fn() }))
vi.mock('../src/services/apiClient', () => ({ default: { get: getMock }, getServiceError: (error) => error }))

import { getUsers } from '../src/services/userService'

describe('userService HTTP contract', () => {
  beforeEach(() => getMock.mockReset())

  it('returns Axios response data without requiring JSON Server', async () => {
    getMock.mockResolvedValue({ data: [{ id: 'user-1', name: 'Demo' }] })
    await expect(getUsers({ role: 'cliente' })).resolves.toEqual([{ id: 'user-1', name: 'Demo' }])
    expect(getMock).toHaveBeenCalledWith('/users', { params: { role: 'cliente' } })
  })

})
