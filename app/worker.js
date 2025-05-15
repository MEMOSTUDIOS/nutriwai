addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

const MODEL_KV = FOOD_MODEL // Bind this KV namespace in Cloudflare dashboard

async function handleRequest(request) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  }

  try {
    const url = new URL(request.url)
    
    // New API endpoints
    if (url.pathname === '/api/global-history') {
      return getGlobalHistory(request, corsHeaders)
    }
    if (url.pathname === '/api/leaderboard') {
      return getLeaderboard(request, corsHeaders)
    }
    if (url.pathname === '/api/user-stats') {
      return getUserStats(request, corsHeaders)
    }

    // Existing endpoints (keep previous implementation)
    // ... [rest of original handleRequest code] ...

  } catch (error) {
    return errorResponse(error, corsHeaders)
  }
}

// New history endpoint with pagination
async function getGlobalHistory(request, corsHeaders) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || 1)
    const limit = parseInt(searchParams.get('limit') || 20)
    
    const historyList = await MODEL_KV.list({ prefix: 'history:', limit, cursor: searchParams.get('cursor') })
    const entries = await Promise.all(historyList.keys.map(async ({ name }) => {
      return JSON.parse(await MODEL_KV.get(name))
    }))

    return new Response(JSON.stringify({
      success: true,
      data: entries,
      nextCursor: historyList.list_complete ? null : historyList.cursor
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    })
  } catch (error) {
    return errorResponse(error, corsHeaders)
  }
}

// New leaderboard endpoint
async function getLeaderboard(request, corsHeaders) {
  try {
    const allUsers = await MODEL_KV.list({ prefix: 'user:' })
    const users = await Promise.all(allUsers.keys.map(async ({ name }) => {
      return JSON.parse(await MODEL_KV.get(name))
    }))

    const sorted = users.sort((a, b) => b.totalPoints - a.totalPoints)
    return new Response(JSON.stringify({
      success: true,
      data: sorted.slice(0, 10)
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    })
  } catch (error) {
    return errorResponse(error, corsHeaders)
  }
}

// Error handling utility
function errorResponse(error, corsHeaders) {
  console.error(error)
  return new Response(JSON.stringify({ 
    success: false, 
    error: error.message 
  }), {
    status: 500,
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  })
}