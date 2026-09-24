import apiClient, { getServiceError } from './apiClient'

const resource = 'perfiles de artistas'

export async function getArtists(params = {}) {
  try {
    const [{ data: profiles }, { data: users }] = await Promise.all([
      apiClient.get('/artistProfiles', { params }),
      apiClient.get('/users'),
    ])
    const usersById = new Map(users.map((user) => [user.id, user]))
    return profiles.map((profile) => ({
      ...profile,
      avatar: usersById.get(profile.userId)?.avatar || '',
      name: usersById.get(profile.userId)?.name || profile.displayName,
    }))
  } catch (error) { throw getServiceError(error, resource) }
}
export async function getArtistById(id) {
  try {
    const [{ data: profile }, { data: users }] = await Promise.all([
      apiClient.get(`/artistProfiles/${id}`),
      apiClient.get('/users'),
    ])
    const user = users.find((candidate) => candidate.id === profile.userId)
    return { ...profile, avatar: user?.avatar || '', name: user?.name || profile.displayName }
  } catch (error) { throw getServiceError(error, resource) }
}
export async function getArtistByUserId(userId) {
  try { return (await apiClient.get('/artistProfiles', { params: { userId } })).data } catch (error) { throw getServiceError(error, resource) }
}
export async function createArtist(artist) {
  try { return (await apiClient.post('/artistProfiles', artist)).data } catch (error) { throw getServiceError(error, resource) }
}
export async function updateArtist(id, changes) {
  try { return (await apiClient.patch(`/artistProfiles/${id}`, changes)).data } catch (error) { throw getServiceError(error, resource) }
}
export async function deleteArtist(id) {
  try { return (await apiClient.delete(`/artistProfiles/${id}`)).data } catch (error) { throw getServiceError(error, resource) }
}
