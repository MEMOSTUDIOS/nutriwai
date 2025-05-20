// ai_food_game_refactored.js (Formerly ai_learn.js)
// AI Learning Model for the Healthy Food Game
// Version: 2.0 - Optimized for learning and memory efficiency concept

/**
 * This file represents an AI learning model for the Healthy Food Game.
 * The AI learns from user interactions, updating its understanding of
 * food classifications (healthy/unhealthy) and user behavior patterns.
 *
 * DATA STRUCTURE
 * --------------
 * - learningEntries: Concise records of user selections (can be pruned or summarized over time)
 * - foodPatterns: Statistical analysis of food healthiness and confidence
 * - userPatterns: Aggregated insights into user behavior (e.g., response time, bias, streaks)
 *
 * LEARNING ALGORITHM
 * -----------------
 * The AI uses a frequency-based model with confidence metrics.
 * As more data is collected, the AI updates its statistical models,
 * focusing on identifying clear patterns and reducing redundant data.
 *
 * Memory optimization is achieved by:
 * - Aggregating raw entries into statistical patterns.
 * - Summarizing older or less impactful data.
 * - Storing structured data efficiently (e.g., JSON objects).
 */

export class AIModel { // Export the class
  constructor() {
    this.version = "2.0";
    this.createdAt = new Date().toISOString();
    this.lastUpdated = new Date().toISOString();
    this.learningEntries = []; // Can be pruned or summarized later
    this.foodPatterns = {};
    this.userPatterns = {
      averageResponseTime: 0,
      selectionBias: 0, // -1 to 1 (left vs right)
      correctStreak: 0,
      incorrectStreak: 0,
      lastSelectionTime: null // Added to track response time
    };
    this.totalInteractions = 0;
    this.modelSizeBytes = 0; // Represents the serialized size of the model's core data
    this.insightsSummary = ""; // Stores summarized insights, not raw "thinking"
  }

  // Add a new learning entry based on user selection
  addLearningEntry(foodName, isHealthy, selectionTime, position) {
    try {
      if (!foodName) {
        console.error("AIModel: Food name is required for learning entry.");
        return;
      }

      const entry = {
        id: this.learningEntries.length + 1,
        timestamp: new Date().toISOString(),
        food: foodName,
        isHealthy: isHealthy,
        selectionTime: selectionTime || 0, // Time taken to select
        position: position // 0 for left, 1 for right
      };

      this.learningEntries.push(entry);
      this.updateFoodPatterns(foodName, isHealthy);
      this.updateUserPatterns(entry);

      this.totalInteractions++;
      this.lastUpdated = new Date().toISOString();
      this.updateModelSize();

      // Generate a concise analysis summary, not just text bloat
      this.generateInsightsSummary(entry);
    } catch (e) {
      console.error("AIModel: Error adding learning entry:", e);
    }
  }

  // Update statistical patterns for specific foods
  updateFoodPatterns(foodName, isHealthy) {
    try {
      if (!this.foodPatterns[foodName]) {
        this.foodPatterns[foodName] = {
          name: foodName,
          healthyCount: 0,
          unhealthyCount: 0,
          totalAppearances: 0,
          firstSeen: new Date().toISOString(),
          healthyConfidence: 0 // Initialize
        };
      }

      const pattern = this.foodPatterns[foodName];
      pattern.totalAppearances++;

      if (isHealthy) {
        pattern.healthyCount++;
      } else {
        pattern.unhealthyCount++;
      }

      // Ensure totalCount is not zero to prevent division by zero
      const totalCount = pattern.healthyCount + pattern.unhealthyCount;
      pattern.healthyConfidence = totalCount > 0 ? pattern.healthyCount / totalCount : 0;

      pattern.lastUpdated = new Date().toISOString();
    } catch (e) {
      console.error("AIModel: Error updating food patterns:", e);
    }
  }

  // Update patterns related to user behavior
  updateUserPatterns(entry) {
    try {
      if (!entry) return;

      // Update selection bias (left vs right preference)
      if (this.totalInteractions > 0) {
        const positionBias = entry.position === 0 ? -1 : 1; // -1 for left, 1 for right
        // Weighted average for selection bias
        this.userPatterns.selectionBias =
          (this.userPatterns.selectionBias * (this.totalInteractions - 1) + positionBias) /
          this.totalInteractions;
      }

      // Update average response time
      if (this.userPatterns.lastSelectionTime && entry.selectionTime) {
        const timeDiff = entry.selectionTime - this.userPatterns.lastSelectionTime;
        // Simple average for now; could be weighted or decaying average
        this.userPatterns.averageResponseTime =
          (this.userPatterns.averageResponseTime * (this.totalInteractions - 1) + timeDiff) /
          this.totalInteractions;
      }
      this.userPatterns.lastSelectionTime = entry.selectionTime;


      // Update streak information
      if (entry.isHealthy) {
        this.userPatterns.correctStreak++;
        this.userPatterns.incorrectStreak = 0;
      } else {
        this.userPatterns.incorrectStreak++;
        this.userPatterns.correctStreak = 0;
      }
    } catch (e) {
      console.error("AIModel: Error updating user patterns:", e);
    }
  }

  // Generate a concise insights summary, not verbose analysis text
  generateInsightsSummary(entry) {
    try {
      if (!entry) return;

      let insight = `Learned: User selected "${entry.food}" as ${entry.isHealthy ? 'healthy' : 'unhealthy'}. `;
      const foodPattern = this.foodPatterns[entry.food];
      if (foodPattern && foodPattern.totalAppearances > 1) {
        const healthyPercent = (foodPattern.healthyConfidence * 100).toFixed(1);
        insight += `AI confidence for "${entry.food}" being healthy: ${healthyPercent}%. `;
      }
      insight += `Total interactions: ${this.totalInteractions}.`;

      // Keep only a recent set of insights or summarize older ones
      // For demonstration, we'll just append, but in a real scenario, this would be optimized.
      // This part simulates "memory growth" through accumulated insights.
      if (this.insightsSummary.length > 5000) { // Prune if too long
          this.insightsSummary = this.insightsSummary.substring(this.insightsSummary.length - 2500);
      }
      this.insightsSummary += `\n- ${new Date().toLocaleTimeString()}: ${insight}`;

    } catch (e) {
      console.error("AIModel: Error generating insights summary:", e);
    }
  }

  // Update the model size calculation based on its data
  updateModelSize() {
    try {
      // Serialize the core data of the model for size calculation
      const serialized = JSON.stringify({
        version: this.version,
        foodPatterns: this.foodPatterns,
        userPatterns: this.userPatterns,
        totalInteractions: this.totalInteractions,
        // insightsSummary and learningEntries could be included, but for
        // optimization, they might be stored separately or summarized further.
        // For accurate 'model size', we'd typically consider the core learned parameters.
        // Including learningEntries for now to reflect growth from raw data.
        learningEntries: this.learningEntries,
        insightsSummary: this.insightsSummary
      });

      this.modelSizeBytes = new Blob([serialized]).size;
    } catch (e) {
      console.error("AIModel: Error updating model size:", e);
      this.modelSizeBytes = 0;
    }
  }

  // Get food health prediction
  predictFoodHealth(foodName) {
    try {
      // Require at least 3 appearances for a confident prediction
      if (!foodName || !this.foodPatterns[foodName] || this.foodPatterns[foodName].totalAppearances < 3) {
        return {
          isHealthy: null,
          confidence: 0,
          message: "Insufficient data to make prediction."
        };
      }

      const pattern = this.foodPatterns[foodName];
      const healthyConf = pattern.healthyConfidence;
      const isHealthy = healthyConf > 0.5;
      // Confidence is the deviation from 0.5 (50/50 chance)
      const confidence = Math.abs(healthyConf - 0.5) * 2; // Scales from 0 to 1

      return {
        isHealthy: isHealthy,
        confidence: confidence, // 0 to 1, higher is more confident
        message: `Prediction: "${foodName}" is ${isHealthy ? "healthy" : "unhealthy"} (${(confidence * 100).toFixed(1)}% confidence)`
      };
    } catch (e) {
      console.error("AIModel: Error predicting food health:", e);
      return {
        isHealthy: null,
        confidence: 0,
        message: "Error during prediction."
      };
    }
  }

  // Generate a learning summary
  generateSummary() {
    try {
      return {
        version: this.version,
        createdAt: this.createdAt,
        lastUpdated: this.lastUpdated,
        totalInteractions: this.totalInteractions,
        knownFoods: Object.keys(this.foodPatterns).length,
        modelSizeBytes: this.modelSizeBytes,
        userAverageResponseTime: this.userPatterns.averageResponseTime.toFixed(2),
        userSelectionBias: this.userPatterns.selectionBias.toFixed(2),
        topConfidenceFoods: this.getTopConfidenceFoods(5)
      };
    } catch (e) {
      console.error("AIModel: Error generating summary:", e);
      return {
        version: this.version,
        error: "Failed to generate AI summary."
      };
    }
  }

  // Get foods with highest confidence ratings
  getTopConfidenceFoods(limit = 5) {
    try {
      const foods = Object.values(this.foodPatterns);
      if (foods.length === 0) return [];

      foods.sort((a, b) => {
        // Sort by how far confidence is from 0.5 (i.e., how sure the AI is)
        const confA = Math.abs(a.healthyConfidence - 0.5);
        const confB = Math.abs(b.healthyConfidence - 0.5);
        return confB - confA; // Descending order of confidence
      });

      return foods.slice(0, limit).map(food => ({
        name: food.name,
        // Determine healthiness based on confidence > 0.5 or most counts
        isHealthy: food.healthyConfidence > 0.5,
        confidence: (Math.abs(food.healthyConfidence - 0.5) * 2).toFixed(2) // Scale to 0-1
      }));
    } catch (e) {
      console.error("AIModel: Error getting top confidence foods:", e);
      return [];
    }
  }

  // Method to load AI state from a saved object
  loadState(state) {
    try {
      if (state) {
        this.version = state.version || this.version;
        this.createdAt = state.createdAt || this.createdAt;
        this.lastUpdated = state.lastUpdated || this.lastUpdated;
        this.learningEntries = state.learningEntries || [];
        this.foodPatterns = state.foodPatterns || {};
        this.userPatterns = state.userPatterns || this.userPatterns;
        this.totalInteractions = state.totalInteractions || 0;
        this.insightsSummary = state.insightsSummary || "";
        this.updateModelSize(); // Recalculate size after loading
        console.log("AIModel: State loaded successfully.");
      }
    } catch (e) {
      console.error("AIModel: Error loading state:", e);
    }
  }

  // Method to get the current AI state for saving
  getState() {
    return {
      version: this.version,
      createdAt: this.createdAt,
      lastUpdated: this.lastUpdated,
      learningEntries: this.learningEntries,
      foodPatterns: this.foodPatterns,
      userPatterns: this.userPatterns,
      totalInteractions: this.totalInteractions,
      insightsSummary: this.insightsSummary
    };
  }
}