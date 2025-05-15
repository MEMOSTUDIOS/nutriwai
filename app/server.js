// Server-side code for the Food Recognition AI
// This file would be used on a Node.js backend

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;

// Configure middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Set up storage for uploaded images
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    cb(null, uuidv4() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// In-memory model (in production you'd use a proper database)
let foodModel = {
  foods: {},
  history: []
};

// Load model if exists
try {
  if (fs.existsSync(path.join(__dirname, 'model.json'))) {
    const data = fs.readFileSync(path.join(__dirname, 'model.json'), 'utf8');
    foodModel = JSON.parse(data);
    console.log('Model loaded successfully');
  }
} catch (err) {
  console.error('Error loading model:', err);
}

// Endpoint to predict food from image
app.post('/api/predict', upload.single('image'), (req, res) => {
  try {
    // In a real app, this would use a machine learning model
    // For demo, we'll use a simple prediction based on existing data
    
    const foods = Object.keys(foodModel.foods);
    
    // If no foods in database yet, return an error or placeholder
    if (foods.length === 0) {
      return res.json({
        success: true,
        prediction: null,
        confidence: 0,
        message: 'No foods in database yet. Please train the model first.'
      });
    }
    
    // Simulate a prediction by choosing a random food from our database
    // In a real app, this would use feature extraction and comparison
    const randomIndex = Math.floor(Math.random() * foods.length);
    const prediction = foods[randomIndex];
    
    // Calculate confidence based on how many times we've seen this food
    // In a real app, this would be based on feature similarity
    const totalSamples = Object.values(foodModel.foods).reduce((sum, food) => sum + food.count, 0);
    const predictedSamples = foodModel.foods[prediction].count;
    const confidence = Math.min(0.5 + (predictedSamples / totalSamples) * 0.5, 0.95);
    
    res.json({
      success: true,
      prediction: prediction,
      confidence: confidence,
      imageUrl: req.file ? `/uploads/${req.file.filename}` : null
    });
  } catch (error) {
    console.error('Error in prediction:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Handle base64 image prediction
app.post('/api/predict-base64', (req, res) => {
  try {
    // Process base64 image
    const imageData = req.body.image;
    
    // In a real app, you would:
    // 1. Decode the base64 image
    // 2. Save it or process it directly
    // 3. Run it through your ML model
    
    // For demo, we'll use a simple prediction like above
    const foods = Object.keys(foodModel.foods);
    
    if (foods.length === 0) {
      return res.json({
        success: true,
        prediction: null,
        confidence: 0,
        message: 'No foods in database yet. Please train the model first.'
      });
    }
    
    const randomIndex = Math.floor(Math.random() * foods.length);
    const prediction = foods[randomIndex];
    const confidence = Math.random() * 0.5 + 0.5; // Random confidence between 50-100%
    
    res.json({
      success: true,
      prediction: prediction,
      confidence: confidence
    });
  } catch (error) {
    console.error('Error in base64 prediction:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint to provide feedback and update the model
app.post('/api/feedback', (req, res) => {
  try {
    const { prediction, actual, confidence, imageData } = req.body;
    
    // Update model with feedback
    if (!foodModel.foods[actual]) {
      foodModel.foods[actual] = { count: 1, features: [] };
    } else {
      foodModel.foods[actual].count++;
    }
    
    // Add to history
    const historyEntry = {
      prediction,
      actual,
      confidence,
      date: new Date().toISOString()
    };
    
    // In a real app, you might save the image here too
    foodModel.history.push(historyEntry);
    
    // Save model
    fs.writeFileSync(path.join(__dirname, 'model.json'), JSON.stringify(foodModel, null, 2));
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error in feedback:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint to get model info
app.get('/api/model-info', (req, res) => {
  try {
    const foodCount = Object.keys(foodModel.foods).length;
    const totalSamples = Object.values(foodModel.foods).reduce((sum, food) => sum + food.count, 0);
    
    res.json({
      success: true,
      foodCount,
      totalSamples,
      historyCount: foodModel.history.length
    });
  } catch (error) {
    console.error('Error getting model info:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Food Recognition API running on port ${port}`);
});

// Add to server.js
// User stats endpoint
app.get('/api/user-stats', (req, res) => {
  const userId = req.query.userId;
  const userData = getUserData(userId); // Implement your data retrieval
  
  res.json({
    totalPoints: userData.totalPoints,
    dailySubmissions: userData.dailySubmissions
  });
});

// Leaderboard endpoint
app.get('/api/leaderboard', (req, res) => {
  // Implement logic to retrieve top users
  const leaderboard = getTopUsers(10); // Your ranking logic
  res.json(leaderboard);
});