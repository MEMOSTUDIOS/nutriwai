# Food Recognition AI Web App

A simple web application that uses machine learning to identify foods from images and learns from user feedback.

## Features

- Capture images using device camera
- Upload food images
- Get AI predictions for food identification
- Provide feedback to help the AI learn
- View learning history and model progress

## Project Structure

```
food-recognition-ai/
├── index.html         # Main HTML file
├── styles.css         # CSS styles
├── app.js             # Frontend JavaScript
├── server.js          # Backend server (optional)
├── package.json       # Node.js dependencies (for backend)
├── .gitignore         # Git ignore file
└── README.md          # This file
```

## Frontend Setup

The frontend is built with plain HTML, CSS, and JavaScript, making it easy to deploy to GitHub Pages or Cloudflare Pages.

1. Clone this repository:
   ```
   git clone https://github.com/yourusername/food-recognition-ai.git
   cd food-recognition-ai
   ```

2. Open `index.html` in your browser to use the client-side only version.

## Backend Setup (Optional)

For production use with a real machine learning model:

1. Install dependencies:
   ```
   npm install
   ```

2. Start the server:
   ```
   node server.js
   ```

3. Update the API endpoints in `app.js` to point to your server.

## Deploy to Cloudflare Pages

1. Push your code to GitHub:
   ```
   git add .
   git commit -m "Initial commit"
   git push
   ```

2. Connect your GitHub repository to Cloudflare Pages:
   - Log in to Cloudflare Dashboard
   - Select "Pages" from the sidebar
   - Click "Create a project"
   - Select your repository
   - Configure build settings:
     - Build command: (leave empty for static site)
     - Build output directory: `/` (root)
   - Deploy

## API Integration

To use with a real backend API:

1. Modify the `processImage()` function in `app.js` to use fetch:
   ```javascript
   async function processImage(imageData) {
     try {
       const response = await fetch('https://your-api-url.com/api/predict', {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json'
         },
         body: JSON.stringify({ image: imageData })
       });
       
       const result = await response.json();
       
       if (result.success) {
         currentPrediction = {
           label: result.prediction,
           confidence: result.confidence
         };
         
         predictionElement.textContent = result.prediction;
         confidenceElement.textContent = `Confidence: ${result.confidence * 100}%`;
         resultContainer.style.display = 'block';
       } else {
         alert('Error processing image: ' + result.error);
       }
     } catch (error) {
       console.error('API error:', error);
       alert('Error connecting to API');
     }
   }
   ```

## Machine Learning Enhancement

For a real ML-based solution:

1. Build a model with TensorFlow.js or use a cloud API
2. Store images and training data in a database
3. Implement feature extraction and proper classification
4. Add versioning for model improvements

## License

MIT