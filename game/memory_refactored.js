// memory_refactored.js
// Manages game memory, user history, and AI model persistence via localStorage.

// AI Integration - This will hold the AIModel instance
let aiModelInstance = null;

// User History for the current session, also persisted to localStorage
const USER_HISTORY_KEY = 'healthyFoodGame_userHistory';
let USER_HISTORY = [];

// AI Model State storage key
const AI_MODEL_STATE_KEY = 'healthyFoodGame_aiModelState';

// --- Food Definitions (Centralized Source of Truth - using numeric IDs and image filenames) ---
export const FOOD_DICTIONARY = {
  1: { name: "Apple", imageFile: "apple.png", isHealthy: true },
  2: { name: "Salad", imageFile: "salad.png", isHealthy: true },
  3: { name: "Broccoli", imageFile: "broccoli.png", isHealthy: true },
  4: { name: "Salmon", imageFile: "salmon.png", isHealthy: true },
  5: { name: "Avocado", imageFile: "avocado.png", isHealthy: true },
  6: { name: "Nuts", imageFile: "nuts.png", isHealthy: true },
  7: { name: "Yogurt", imageFile: "yogurt.png", isHealthy: true },
  8: { name: "Oatmeal", imageFile: "oatmeal.png", isHealthy: true },
  101: { name: "Pizza", imageFile: "pizza.png", isHealthy: false },
  102: { name: "Ice Cream", imageFile: "icecream.png", isHealthy: false },
  103: { name: "Burger", imageFile: "burger.png", isHealthy: false },
  104: { name: "Fries", imageFile: "fries.png", isHealthy: false },
  105: { name: "Donut", imageFile: "donut.png", isHealthy: false },
  106: { name: "Soda", imageFile: "soda.png", isHealthy: false },
  107: { name: "Cake", imageFile: "cake.png", isHealthy: false },
  108: { name: "Chips", imageFile: "chips.png", isHealthy: false }
};

// Store numeric IDs for healthy and unhealthy foods
export const HEALTHY_FOOD_IDS = Object.keys(FOOD_DICTIONARY).filter(id => FOOD_DICTIONARY[id].isHealthy).map(Number);
export const UNHEALTHY_FOOD_IDS = Object.keys(FOOD_DICTIONARY).filter(id => !FOOD_DICTIONARY[id].isHealthy).map(Number);

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
    USER_HISTORY = [];
  }

  console.log("Memory system initialized with AI integration.");
}

/**
 * Logs a user interaction and updates the AI model.
 * Persists the history and AI state to localStorage.
 * @param {number} foodId - The ID of the food selected (e.g., 1 for Apple).
 * @param {boolean} isHealthy - True if the selected food was healthy, false otherwise.
 * @param {number} round - The current game round number.
 * @param {number} position - The position of the selected food (0 for left, 1 for right).
 */
export function logUserInteraction(foodId, isHealthy, round, position) {
  if (!aiModelInstance) {
    console.error("Memory: AI model instance not initialized.");
    return false;
  }
  
  const foodName = FOOD_DICTIONARY[foodId]?.name || `Unknown Food (ID: ${foodId})`;
  const timestamp = Date.now();

  const historyEntry = {
    round: round,
    foodId: foodId,
    foodName: foodName,
    isHealthy: isHealthy,
    timestamp: timestamp,
    position: position
  };

  USER_HISTORY.push(historyEntry);
  aiModelInstance.addLearningEntry(foodName, isHealthy, timestamp, position);

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
      compressionRatio: "N/A",
      topInsights: []
    };
  }

  const aiSummary = aiModelInstance.generateSummary();

  const totalMemoryBytes = (JSON.stringify(USER_HISTORY).length + JSON.stringify(aiModelInstance.getState()).length);

  return {
    memoryUsed: `${(totalMemoryBytes / 1024).toFixed(2)} KB (AI: ${(aiSummary.modelSizeBytes / 1024).toFixed(2)} KB)`,
    totalEntries: aiSummary.totalInteractions,
    patternsKnown: aiSummary.knownFoods,
    lastUpdated: aiSummary.lastUpdated,
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

// Helper to get food name from ID (used for display in history and AI learning)
export function getFoodNameById(id) {
    return FOOD_DICTIONARY[id]?.name || `Unknown Food (ID: ${id})`;
}

// Helper to get food image filename from ID
export function getFoodImageFileById(id) {
    return FOOD_DICTIONARY[id]?.imageFile || `default.png`; // Fallback to a default image
}

// Helper to check if a food ID is healthy
export function isFoodHealthyById(id) {
    return FOOD_DICTIONARY[id]?.isHealthy || false;
}