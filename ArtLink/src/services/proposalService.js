import apiClient, { getServiceError } from './apiClient'

const resource = 'propuestas'

export async function getProposals(params = {}) {
  try {
    return (await apiClient.get('/proposals', { params })).data
  } catch (error) {
    throw getServiceError(error, resource)
  }
}

export async function getProposalsByRequestId(requestId) {
  try {
    return (await apiClient.get('/proposals', { params: { requestId } })).data
  } catch (error) {
    throw getServiceError(error, resource)
  }
}

export async function getProposalById(id) {
  try {
    return (await apiClient.get(`/proposals/${id}`)).data
  } catch (error) {
    throw getServiceError(error, resource)
  }
}

export async function createProposal(proposal) {
  try {
    return (
      await apiClient.post('/proposals', {
        ...proposal,
        createdAt: proposal.createdAt || new Date().toISOString(),
      })
    ).data
  } catch (error) {
    throw getServiceError(error, resource)
  }
}

export async function updateProposal(id, changes) {
  try {
    return (await apiClient.patch(`/proposals/${id}`, changes)).data
  } catch (error) {
    throw getServiceError(error, resource)
  }
}

export async function deleteProposal(id) {
  try {
    return (await apiClient.delete(`/proposals/${id}`)).data
  } catch (error) {
    throw getServiceError(error, resource)
  }
}
