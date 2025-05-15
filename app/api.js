const apiUrl = 'nutriwai3.pages.dev' // Update with actual URL

// Add new API functions
async function fetchGlobalHistory(page = 1, limit = 20) {
  try {
    const response = await fetch(`${apiUrl}/api/global-history?page=${page}&limit=${limit}`)
    if (!response.ok) throw new Error('Failed to fetch history')
    return await response.json()
  } catch (error) {
    console.error('History fetch error:', error)
    return { success: false, error: error.message }
  }
}

async function fetchLeaderboard() {
  try {
    const response = await fetch(`${apiUrl}/api/leaderboard`)
    if (!response.ok) throw new Error('Failed to fetch leaderboard')
    return await response.json()
  } catch (error) {
    console.error('Leaderboard fetch error:', error)
    return { success: false, error: error.message }
  }
}

async function fetchUserStats(userId) {
  try {
    const response = await fetch(`${apiUrl}/api/user-stats?userId=${userId}`)
    if (!response.ok) throw new Error('Failed to fetch user stats')
    return await response.json()
  } catch (error) {
    console.error('User stats fetch error:', error)
    return { success: false, error: error.message }
  }
}