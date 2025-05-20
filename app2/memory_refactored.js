// memory_refactored.js (Formerly memory.txt)
// Manages game memory, user history, and AI model persistence via localStorage.

// AI Integration - This will hold the AIModel instance
let aiModelInstance = null;

// User History for the current session, also persisted to localStorage
const USER_HISTORY_KEY = 'healthyFoodGame_userHistory';
let USER_HISTORY = [];

// AI Model State storage key
const AI_MODEL_STATE_KEY = 'healthyFoodGame_aiModelState';

// --- Food Definitions (Centralized Source of Truth) ---
// This dictionary is used to manage food data consistently.
// It also provides a mapping between simplified food names and their properties.
export const FOOD_DICTIONARY = {
  "apple": { name: "Apple", isHealthy: true, imageText: "Apple" },
  "salad": { name: "Salad", isHealthy: true, imageText: "Salad" },
  "broccoli": { name: "Broccoli", isHealthy: true, imageText: "Broccoli" },
  "salmon": { name: "Salmon", isHealthy: true, imageText: "Salmon" },
  "avocado": { name: "Avocado", isHealthy: true, imageText: "Avocado" },
  "nuts": { name: "Nuts", isHealthy: true, imageText: "Nuts" },
  "yogurt": { name: "Yogurt", isHealthy: true, imageText: "Yogurt" },
  "oatmeal": { name: "Oatmeal", isHealthy: true, imageText: "Oatmeal" },
  "pizza": { name: "Pizza", isHealthy: false, imageText: "Pizza" },
  "icecream": { name: "Ice Cream", isHealthy: false, imageText: "Ice Cream" },
  "burger": { name: "Burger", isHealthy: false, imageText: "Burger" },
  "fries": { name: "Fries", isHealthy: false, imageText: "Fries" },
  "donut": { name: "Donut", isHealthy: false, imageText: "Donut" },
  "soda": { name: "Soda", isHealthy: false, imageText: "Soda" },
  "cake": { name: "Cake", isHealthy: false, imageText: "Cake" },
  "chips": { name: "Chips", isHealthy: false, imageText: "Chips" }
};

export const HEALTHY_FOOD_NAMES = Object.keys(FOOD_DICTIONARY).filter(key => FOOD_DICTIONARY[key].isHealthy);
export const UNHEALTHY_FOOD_NAMES = Object.keys(FOOD_DICTIONARY).filter(key => !FOOD_DICTIONARY[key].isHealthy);


/**
 * Initializes the memory system and loads AI model state and user history from localStorage.
 * @param {object} modelInstance - An instance of the AIModel class.
 */
export function initializeMemory(modelInstance) {
  aiModelInstance = modelInstance;

  try {
    // Load AI Model State
    const savedAIState = localStorage.getItem(AI_MODEL_STATE_KEY);
    if (savedAIState) {
      const parsedState = JSON.parse(savedAIState);
      aiModelInstance.loadState(parsedState);
      console.log("Memory: AI model state loaded from localStorage.");
    } else {
      console.log("Memory: No AI model state found in localStorage, starting fresh.");
    }

    // Load User History
    const savedUserHistory = localStorage.getItem(USER_HISTORY_KEY);
    if (savedUserHistory) {
      USER_HISTORY = JSON.parse(savedUserHistory);
      console.log("Memory: User history loaded from localStorage.");
    } else {
      console.log("Memory: No user history found in localStorage, starting fresh.");
    }
  } catch (e) {
    console.error("Memory: Error initializing memory or loading from localStorage:", e);
    // If loading fails, start with empty data to prevent breaking the app
    USER_HISTORY = [];
    aiModelInstance = new AIModel(); // Re-initialize AI if loading fails
  }

  console.log("Memory system initialized with AI integration.");
}

/**
 * Logs a user interaction and updates the AI model.
 * Persists the history and AI state to localStorage.
 * @param {string} foodName - The name of the food selected (e.g., "apple").
 * @param {boolean} isHealthy - True if the selected food was healthy, false otherwise.
 * @param {number} round - The current game round number.
 * @param {number} position - The position of the selected food (0 for left, 1 for right).
 */
export function logUserInteraction(foodName, isHealthy, round, position) {
  if (!aiModelInstance) {
    console.error("Memory: AI model instance not initialized.");
    return false;
  }

  const timestamp = Date.now();

  const historyEntry = {
    round: round,
    foodName: foodName,
    isHealthy: isHealthy,
    timestamp: timestamp,
    position: position // Add position to history for AI
  };

  USER_HISTORY.push(historyEntry);
  aiModelInstance.addLearningEntry(foodName, isHealthy, timestamp, position); // Pass position to AI

  // Save updated history and AI state to localStorage
  try {
    localStorage.setItem(USER_HISTORY_KEY, JSON.stringify(USER_HISTORY));
    localStorage.setItem(AI_MODEL_STATE_KEY, JSON.stringify(aiModelInstance.getState()));
  } catch (e) {
    console.error("Memory: Error saving data to localStorage:", e);
  }

  return true;
}

/**
 * Generates a summary of the current memory and AI learning progress.
 * @returns {object} An object containing memory statistics and AI insights.
 */
export function generateMemorySummary() {
  if (!aiModelInstance) {
    return {
      memoryUsed: "N/A",
      totalEntries: 0,
      patternsKnown: 0,
      lastUpdated: "N/A",
      compressionRatio: "N/A", // This concept is more internal to AIModel now
      topInsights: []
    };
  }

  const aiSummary = aiModelInstance.generateSummary();

  // Calculate approximate memory used for history and AI model combined
  const totalMemoryBytes = (JSON.stringify(USER_HISTORY).length + JSON.stringify(aiModelInstance.getState()).length);
  const maxBytesTheoretical = 5 * 1024 * 1024; // Example: 5MB localStorage limit

  return {
    memoryUsed: `${(totalMemoryBytes / 1024).toFixed(2)} KB (AI: ${aiSummary.modelSizeBytes / 1024}) KB`,
    totalEntries: aiSummary.totalInteractions, // AI's total interactions count
    patternsKnown: aiSummary.knownFoods,
    lastUpdated: aiSummary.lastUpdated,
    // CompressionRatio concept is now more about how the AI internally handles data
    compressionRatio: "Internal AI optimization",
    topInsights: aiSummary.topConfidenceFoods
  };
}

/**
 * Retrieves the full user history.
 * @returns {Array} The user's interaction history.
 */
export function getUserHistory() {
  return USER_HISTORY;
}

// Initial load of history and AI state when the module loads
// This is handled by initializeMemory in the main script now for better control.
// console.log("Memory system module loaded.");