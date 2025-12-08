import { ref, computed, onMounted } from 'vue'
import { 
  projectionYears, 
  projectionP10, 
  projectionP50, 
  projectionP90, 
  portfolioRows, 
  cashflowRows 
} from './mockData'

/**
 * Composable for fetching and managing results data from the API
 * @param {string|number} scenarioId - The scenario ID to fetch results for
 * @returns {Object} Object containing loading, error, and results reactive refs
 */
export function useResultsData(scenarioId) {
  const loading = ref(false)
  const error = ref(null)
  const results = ref(null)

  /**
   * Fetches results data from the API endpoint
   * @param {string|number} id - The scenario ID to fetch
   */
  const fetchResults = async (id) => {
    loading.value = true
    error.value = null

    try {
      // TODO: Replace with actual API endpoint when available
      // const response = await fetch(`/api/results/${id}`)
      // if (!response.ok) {
      //   throw new Error(`HTTP error! status: ${response.status}`)
      // }
      // const data = await response.json()
      // results.value = data

      // Placeholder: Return mock data until API endpoint is ready
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300))

      results.value = {
        projectionYears,
        projectionP10,
        projectionP50,
        projectionP90,
        portfolioRows,
        cashflowRows
      }
    } catch (err) {
      error.value = err.message || 'Failed to fetch results data'
      console.error('Error fetching results:', err)
    } finally {
      loading.value = false
    }
  }

  // Fetch data when component mounts
  onMounted(() => {
    if (scenarioId) {
      fetchResults(scenarioId)
    }
  })

  return {
    loading,
    error,
    results,
    fetchResults,
    // Convenience getters for direct access to data
    projectionYears: computed(() => results.value?.projectionYears || []),
    projectionP10: computed(() => results.value?.projectionP10 || []),
    projectionP50: computed(() => results.value?.projectionP50 || []),
    projectionP90: computed(() => results.value?.projectionP90 || []),
    portfolioRows: computed(() => results.value?.portfolioRows || []),
    cashflowRows: computed(() => results.value?.cashflowRows || [])
  }
}

