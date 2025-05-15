// Cloudflare Worker script for the API backend
// This file would be used if deploying the backend on Cloudflare Workers

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

// KV namespace to store our model data
// You need to create this in your Cloudflare dashboard
// const MODEL_KV = YOUR_KV_NAMESPACE

// Main request handler
async function handleRequest(request) {
  try {
    const url = new URL(request.url)
    const path = url.pathname
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
    
    // Handle OPTIONS request for CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders
      })
    }
    
    // API routes
    if (path.startsWith('/api/')) {
      // Model info endpoint
      if (path === '/api/model-info' && request.method === 'GET') {
        return await getModelInfo(corsHeaders)
      }
      
      // Prediction endpoint
      else if (path === '/api/predict-base64' && request.method === 'POST') {
        return await predictFood(request, corsHeaders)
      }
      
      // Feedback endpoint
      else if (path === '/api/feedback' && request.method === 'POST') {
        return await saveFeedback(request, corsHeaders)
      }
      
      // Unknown API endpoint
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Unknown API endpoint' 
      }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      })
    }
    
    // If not an API request, respond with an error
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Not Found' 
    }), {
      status: 404,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    })
    
  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
  }
}

// Get model information
async function getModelInfo(corsHeaders) {
  try {
    // Get model from KV storage
    // In a real implementation, you would use:
    // const modelJson = await MODEL_KV.get('foodModel')
    // const model = modelJson ? JSON.parse(modelJson) : { foods: {}, history: [] }
    
    // For this example, we'll use a mock model
    const model = { 
      foods: {
        "apple": { count: 10 },
        "banana": { count: 8 },
        "orange": { count: 7 },
        "pizza": { count: 12 }
      }, 
      history: Array(15).fill({}) 
    }
    
    const foodCount = Object.keys(model.foods).length
    const totalSamples = Object.values(model.foods).reduce((sum, food) => sum + food.count, 0)
    
    return new Response(JSON.stringify({
      success: true,
      foodCount,
      totalSamples,
      historyCount: model.history.length
    }), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    })
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    })
  }
}

// Process food prediction from image
async function predictFood(request, corsHeaders) {
  try {
    // Get request body
    const body = await request.json()
    
    // In a real implementation, you would:
    // 1. Process the base64 image
    // 2. Extract features
    // 3. Compare to known foods
    // 4. Return the best match
    
    // For now, we'll use a mock implementation
    
    // Get model from KV storage
    // In a real implementation, you would use:
    // const modelJson = await MODEL_KV.get('foodModel')
    // const model = modelJson ? JSON.parse(modelJson) : { foods: {}, history: [] }
    
    // Mock model for demonstration
    const model = { 
      foods: {
        "apple": { count: 10 },
        "banana": { count: 8 },
        "orange": { count: 7 },
        "pizza": { count: 12 }
      }
    }
    
    const foods = Object.keys(model.foods)
    
    if (foods.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        prediction: null,
        confidence: 0,
        message: 'No foods in database yet'
      }), {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      })
    }
    
    // Simple random prediction for demo
    // In a real app, this would use ML techniques
    const randomIndex = Math.floor(Math.random() * foods.length)
    const prediction = foods[randomIndex]
    
    // Calculate confidence based on food count
    const totalSamples = Object.values(model.foods).reduce((sum, food) => sum + food.count, 0)
    const predictedSamples = model.foods[prediction].count
    const confidence = Math.min(0.5 + (predictedSamples / totalSamples) * 0.5, 0.95)
    
    return new Response(JSON.stringify({
      success: true,
      prediction,
      confidence
    }), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    })
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    })
  }
}

// Save user feedback
async function saveFeedback(request, corsHeaders) {
  try {
    // Get request body
    const feedback = await request.json()
    
    // In a real implementation, you would:
    // 1. Get the current model from KV
    // 2. Update it with the new feedback
    // 3. Save it back to KV
    
    // Example implementation:
    // const modelJson = await MODEL_KV.get('foodModel')
    // const model = modelJson ? JSON.parse(modelJson) : { foods: {}, history: [] }
    
    // // Update model with feedback
    // if (!model.foods[feedback.actual]) {
    //   model.foods[feedback.actual] = { count: 1, features: [] }
    // } else {
    //   model.foods[feedback.actual].count++
    // }
    
    // // Add to history
    // model.history.push({
    //   prediction: feedback.prediction,
    //   actual: feedback.actual,
    //   confidence: feedback.confidence,
    //   date: new Date().toISOString()
    // })
    
    // // Save updated model
    // await MODEL_KV.put('foodModel', JSON.stringify(model))
    
    return new Response(JSON.stringify({
      success: true
    }), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    })
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    })
  }
}

// Update Cloudflare Worker to handle points
async function saveFeedback(request, corsHeaders) {
  try {
    const feedback = await request.json();
    const now = new Date();
    
    // Get or create user data
    let userData = await MODEL_KV.get(`user:${feedback.userId}`);
    userData = userData ? JSON.parse(userData) : {
      totalPoints: 0,
      dailySubmissions: 0,
      lastSubmissionDate: ''
    };

    // Reset daily count if new day
    const currentDate = now.toISOString().split('T')[0];
    if (userData.lastSubmissionDate !== currentDate) {
      userData.dailySubmissions = 0;
      userData.lastSubmissionDate = currentDate;
    }

    // Calculate points
    let points = 5;
    if (feedback.actual && feedback.actual !== feedback.prediction) points += 5;
    
    userData.dailySubmissions++;
    if (userData.dailySubmissions === 10) points += 20;
    
    userData.totalPoints += points;

    // Save user data
    await MODEL_KV.put(`user:${feedback.userId}`, JSON.stringify(userData));

    // Save to global history
    const historyEntry = {
      ...feedback,
      points,
      timestamp: now.toISOString(),
      userId: feedback.userId
    };
    
    await MODEL_KV.put(`history:${now.getTime()}`, JSON.stringify(historyEntry));

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    return errorResponse(error, corsHeaders);
  }
}