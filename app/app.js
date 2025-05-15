// Model data - This will simulate our AI model client-side
// In production, this would connect to a backend
let foodModel = {
    foods: {
        "apple": { count: 5, features: [/* would contain feature vectors in real app */] },
        "banana": { count: 5, features: [] },
        "orange": { count: 5, features: [] },
        "pizza": { count: 3, features: [] },
        "burger": { count: 3, features: [] }
    },
    history: []
};

// DOM Elements
const videoElement = document.getElementById('videoElement');
const videoContainer = document.getElementById('videoContainer');
const imagePreview = document.getElementById('imagePreview');
const previewImage = document.getElementById('previewImage');
const captureBtn = document.getElementById('captureBtn');
const uploadBtn = document.getElementById('uploadBtn');
const fileInput = document.getElementById('fileInput');
const resetBtn = document.getElementById('resetBtn');
const resultContainer = document.getElementById('resultContainer');
const predictionElement = document.getElementById('prediction');
const confidenceElement = document.getElementById('confidence');
const correctBtn = document.getElementById('correctBtn');
const wrongBtn = document.getElementById('wrongBtn');
const correctLabel = document.getElementById('correctLabel');
const foodNameInput = document.getElementById('foodNameInput');
const submitCorrectLabel = document.getElementById('submitCorrectLabel');
const historyTableBody = document.getElementById('historyTableBody');

let currentImageData = null;
let currentPrediction = null;
let stream = null;

// Initialize the camera
async function initCamera() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoElement.srcObject = stream;
    } catch (err) {
        console.error("Error accessing camera:", err);
        alert("Camera access is required for this app. Please allow camera permissions.");
    }
}

// Start the app
document.addEventListener('DOMContentLoaded', () => {
    initCamera();
    loadModel();
});

// Capture image from camera
captureBtn.addEventListener('click', () => {
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    canvas.getContext('2d').drawImage(videoElement, 0, 0);
    currentImageData = canvas.toDataURL('image/png');
    
    previewImage.src = currentImageData;
    videoContainer.style.display = 'none';
    imagePreview.style.display = 'block';
    captureBtn.style.display = 'none';
    uploadBtn.style.display = 'none';
    resetBtn.style.display = 'inline';
    
    // Process the image
    processImage(currentImageData);
});

// Handle file upload
uploadBtn.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
        const reader = new FileReader();
        reader.onload = (event) => {
            currentImageData = event.target.result;
            previewImage.src = currentImageData;
            videoContainer.style.display = 'none';
            imagePreview.style.display = 'block';
            captureBtn.style.display = 'none';
            uploadBtn.style.display = 'none';
            resetBtn.style.display = 'inline';
            
            // Process the image
            processImage(currentImageData);
        };
        reader.readAsDataURL(e.target.files[0]);
    }
});

// Reset to take new photo
resetBtn.addEventListener('click', () => {
    if (stream) {
        videoContainer.style.display = 'block';
        imagePreview.style.display = 'none';
        captureBtn.style.display = 'inline';
        uploadBtn.style.display = 'inline';
        resetBtn.style.display = 'none';
        resultContainer.style.display = 'none';
        correctLabel.style.display = 'none';
        currentImageData = null;
        currentPrediction = null;
    } else {
        initCamera();
    }
});

// Process image (simulate AI model prediction)
async function processImage(imageData) {
    // Show loading state
    showLoadingState();
    
    let result;
    
    // Check if we should use the server API
    if (useServerAPI) {
        // Use server API for prediction
        result = await processImageWithAPI(imageData);
        
        if (result.success) {
            currentPrediction = {
                label: result.prediction,
                confidence: result.confidence
            };
        } else {
            // Fallback to local prediction if API fails
            console.error('API failed, using local prediction:', result.error);
            result = makeLocalPrediction();
            currentPrediction = result;
        }
    } else {
        // Use local prediction
        result = makeLocalPrediction();
        currentPrediction = result;
    }
    
    // Display prediction
    predictionElement.textContent = currentPrediction.label;
    confidenceElement.textContent = `Confidence: ${(currentPrediction.confidence * 100).toFixed(0)}%`;
    resultContainer.style.display = 'block';
    hideLoadingState();
}

// Make a local prediction (simulated)
function makeLocalPrediction() {
    // Simulate random prediction from our model
    const foods = Object.keys(foodModel.foods);
    
    // If no foods in the model yet, return a default message
    if (foods.length === 0) {
        return {
            label: "Unknown",
            confidence: 0.5
        };
    }
    
    const randomIndex = Math.floor(Math.random() * foods.length);
    const prediction = foods[randomIndex];
    const confidence = (Math.random() * 0.5 + 0.5).toFixed(2); // Random confidence between 50-100%
    
    return {
        label: prediction,
        confidence: parseFloat(confidence)
    };
}

// Show loading state while processing
function showLoadingState() {
    predictionElement.textContent = "Analyzing...";
    confidenceElement.textContent = "";
    resultContainer.style.display = 'block';
}

// Hide loading state when processing is complete
function hideLoadingState() {
    // Already handled in processImage function
}

// Handle "Correct" feedback
correctBtn.addEventListener('click', async () => {
    if (currentPrediction && currentImageData) {
        const feedback = {
            prediction: currentPrediction.label,
            actual: currentPrediction.label,
            confidence: currentPrediction.confidence,
            imageData: currentImageData
        };
        
        if (useServerAPI) {
            // Send feedback to server
            const success = await sendFeedbackToAPI(feedback);
            if (!success) {
                console.warn('Failed to send feedback to API, saving locally');
                updateLocalModel(feedback);
            }
        } else {
            // Update local model
            updateLocalModel(feedback);
        }
        
        alert("Thank you for the feedback! The AI has learned from this example.");
        resetBtn.click();
    }
});

// Handle "Wrong" feedback
wrongBtn.addEventListener('click', () => {
    correctLabel.style.display = 'block';
});

// Submit correct label
submitCorrectLabel.addEventListener('click', async () => {
    const correctFoodName = foodNameInput.value.trim().toLowerCase();
    
    if (correctFoodName) {
        const feedback = {
            prediction: currentPrediction.label,
            actual: correctFoodName,
            confidence: currentPrediction.confidence,
            imageData: currentImageData
        };
        
        if (useServerAPI) {
            // Send feedback to server
            const success = await sendFeedbackToAPI(feedback);
            if (!success) {
                console.warn('Failed to send feedback to API, saving locally');
                updateLocalModel(feedback);
            }
        } else {
            // Update local model
            updateLocalModel(feedback);
        }
        
        alert(`Thank you! The AI now knows this is ${correctFoodName}.`);
        resetBtn.click();
    } else {
        alert("Please enter a valid food name.");
    }
});

// Update local model with feedback
function updateLocalModel(feedback) {
    // Add or update food in the model
    if (!foodModel.foods[feedback.actual]) {
        foodModel.foods[feedback.actual] = { count: 1, features: [] };
    } else {
        foodModel.foods[feedback.actual].count++;
    }
    
    // Add to history
    addToHistory(
        feedback.imageData,
        feedback.prediction,
        feedback.actual,
        feedback.confidence
    );
    
    // Save model to localStorage
    saveModel();
}

// Add an entry to the history table
function addToHistory(imageData, prediction, actual, confidence) {
    const historyItem = {
        imageData: imageData,
        prediction: prediction,
        actual: actual,
        confidence: confidence,
        date: new Date().toLocaleString()
    };
    
    foodModel.history.push(historyItem);
    
    // Update history table
    const row = document.createElement('tr');
    row.innerHTML = `
        <td><img src="${imageData}" alt="${actual}"></td>
        <td>${prediction}</td>
        <td>${actual}</td>
        <td>${(confidence * 100).toFixed(0)}%</td>
        <td>${historyItem.date}</td>
    `;
    
    historyTableBody.prepend(row);
}

// Save model data 
function saveModel() {
    console.log("Saving model:", foodModel);
    
    // In production, this would be an API call:
    // fetch('/api/save-model', {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json'
    //     },
    //     body: JSON.stringify(foodModel)
    // });
    
    // For demo purposes, save to localStorage
    localStorage.setItem('foodModel', JSON.stringify(foodModel));
}

// Load any existing model data
function loadModel() {
    const savedModel = localStorage.getItem('foodModel');
    if (savedModel) {
        try {
            foodModel = JSON.parse(savedModel);
            console.log("Loaded saved model:", foodModel);
            
            // Populate history table
            foodModel.history.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><img src="${item.imageData}" alt="${item.actual}"></td>
                    <td>${item.prediction}</td>
                    <td>${item.actual}</td>
                    <td>${(item.confidence * 100).toFixed(0)}%</td>
                    <td>${item.date}</td>
                `;
                historyTableBody.appendChild(row);
            });
        } catch (err) {
            console.error("Error loading saved model:", err);
        }
    }
}

// In app.js
let userId = localStorage.getItem('userId') || crypto.randomUUID();
localStorage.setItem('userId', userId);

// Update processImage function
async function processImage(imageData) {
  // Add loading state
  showLoadingState();
  try {
    const result = await (useServerAPI ? 
      processImageWithAPI(imageData) : 
      makeLocalPrediction()
    );
    
    // Update UI
    currentImageData = imageData;
    displayPrediction(result);
    
    // Prefetch user data
    if(useServerAPI) updateUserStats();
    
  } catch (error) {
    handleError(error);
  }
}

async function updateUserStats() {
  try {
    const response = await fetch(`${apiUrl}/api/user-stats?userId=${userId}`);
    const stats = await response.json();
    
    document.getElementById('userPoints').textContent = stats.totalPoints;
    document.getElementById('dailyProgress').value = stats.dailySubmissions;
    document.getElementById('dailyCount').textContent = 
      `${stats.dailySubmissions}/10 daily submissions`;
      
    updateLeaderboard();
  } catch (error) {
    console.error('Failed to update stats:', error);
  }
}

// Add history fetching to app.js
async function loadGlobalHistory() {
  try {
    const response = await fetch(`${apiUrl}/api/global-history`);
    const history = await response.json();
    
    history.forEach(entry => addHistoryRow(entry));
  } catch (error) {
    console.error('Failed to load global history:', error);
  }
}

function addHistoryRow(entry) {
  const row = document.createElement('tr');
  row.innerHTML = `
    <td><img src="${entry.imageData}" alt="${entry.actual}"></td>
    <td>${entry.prediction}</td>
    <td>${entry.actual}</td>
    <td>${entry.userId.slice(0, 6)}</td>
    <td>${new Date(entry.timestamp).toLocaleDateString()}</td>
    <td>${entry.points}</td>
  `;
  historyTableBody.prepend(row);
}

// Add pagination state
let historyPage = 1
const historyLimit = 20
let hasMoreHistory = true

// Add loading state management
const loadingStates = {
  history: false,
  prediction: false,
  feedback: false
}

function setLoadingState(type, isLoading) {
  loadingStates[type] = isLoading
  document.querySelectorAll(`[data-loading="${type}"]`).forEach(el => {
    el.classList.toggle('loading', isLoading)
  })
}

// Enhanced history loading
async function loadMoreHistory() {
  if (!hasMoreHistory || loadingStates.history) return
  
  setLoadingState('history', true)
  try {
    const result = await fetchGlobalHistory(historyPage, historyLimit)
    if (result.success) {
      result.data.forEach(addHistoryRow)
      historyPage++
      hasMoreHistory = !!result.nextCursor
    }
  } catch (error) {
    showError('Failed to load more history')
  } finally {
    setLoadingState('history', false)
  }
}

// Add infinite scroll
window.addEventListener('scroll', () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
    loadMoreHistory()
  }
})

// Enhanced error handling
function showError(message) {
  const errorEl = document.createElement('div')
  errorEl.className = 'error-message'
  errorEl.textContent = message
  document.body.prepend(errorEl)
  setTimeout(() => errorEl.remove(), 5000)
}

// Update processImage with loading state
async function processImage(imageData) {
  setLoadingState('prediction', true)
  try {
    // ... existing processImage logic ...
  } catch (error) {
    showError('Image processing failed: ' + error.message)
  } finally {
    setLoadingState('prediction', false)
  }
}