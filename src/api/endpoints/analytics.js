import { apiClient } from "../client"

/**
 * Track resource view analytics
 * Fire-and-forget - does not block navigation and silently ignores errors
 * @param {string|number} resourceId - The ID of the resource being viewed
 */
export const trackResourceView = async (resourceId) => {
  if (!resourceId) return

  try {
    await apiClient.post(`/api/track-view/${resourceId}/`)
  } catch {
    console.error('Error tracking resource view')
  }
}

/**
 * Track resource download analytics
 * Fire-and-forget - does not block download and silently ignores errors
 * @param {string|number} resourceId - The ID of the resource being downloaded
 */
export const trackResourceDownload = async (resourceId) => {
  if (!resourceId) return

  try {
    await apiClient.post(`/api/track-download/${resourceId}/`)
  } catch {
    console.error('Error tracking resource download')
  }
}

/**
 * Track MIP download analytics
 * Fire-and-forget - does not block download and silently ignores errors
 * @param {string} projectId - The project ID from create-project API response
 */
export const trackSolutionDownload = async (projectId) => {
  if (!projectId) return

  try {
    await apiClient.post(`/api/track-solution-download/${projectId}/`)
  } catch {
    console.error('Error tracking solution download')
  }
}
