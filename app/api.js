const apiUrl = 'https://your-api-url.com'; // Change this to your actual API URL

// Function to check if server is available
async function checkServerAvailability() {
  try {
    const response = await fetch(`${apiUrl}/api/model-info`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      console.log('Connected to server API');
      return true;
    } else {
      console.log('Server API available but returned error');
      return false;
    }
  } catch (error) {
    console.log('Running in offline mode, using local storage');
    return false;
  }
}

// Process image using server API if available
async function processImageWithAPI(imageData) {
  try {
    const response = await fetch(`${apiUrl}/api/predict-base64`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ image: imageData })
    });
    
    const result = await response.json();
    
    if (result.success) {
      return {
        success: true,
        prediction: result.prediction,
        confidence: result.confidence
      };
    } else {
      throw new Error(result.error || 'Unknown API error');
    }
  } catch (error) {
    console.error('Error with API prediction:', error);
    return { success: false, error: error.message };
  }
}

// Send feedback to server
async function sendFeedbackToAPI(feedback) {
  try {
    const response = await fetch(`${apiUrl}/api/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(feedback)
    });
    
    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Error sending feedback to API:', error);
    return false;
  }
}

// Initialize app with server check
let useServerAPI = false;

document.addEventListener('DOMContentLoaded', async () => {
  useServerAPI = await checkServerAvailability();
  
  // Load model from localStorage if not using server
  if (!useServerAPI) {
    loadModel();
  }
  
  // Initialize camera
  initCamera();
});