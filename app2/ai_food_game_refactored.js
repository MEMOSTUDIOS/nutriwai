// ai_food_game_refactored.js (No major changes needed, just confirming it's correct)
// AI Learning Model for the Healthy Food Game
// Version: 2.0 - Optimized for learning and memory efficiency concept

export class AIModel {
  constructor() {
    this.version = "2.0";
    this.createdAt = new Date().toISOString();
    this.lastUpdated = new Date().toISOString();
    this.learningEntries = [];
    this.foodPatterns = {};
    this.userPatterns = {
      averageResponseTime: 0,
      selectionBias: 0,
      correctStreak: 0,
      incorrectStreak: 0,
      lastSelectionTime: null
    };
    this.totalInteractions = 0;
    this.modelSizeBytes = 0;
    this.insightsSummary = "";
  }

  addLearningEntry(foodName, isHealthy, selectionTime, position) {
    try {
      if (!foodName) {
        console.error("AIModel: Food name is required for learning entry.");
        return;
      }

      const entry = {
        id: this.learningEntries.length + 1,
        timestamp: new Date().toISOString(),
        food: foodName, // AI learns based on the food's name string
        isHealthy: isHealthy,
        selectionTime: selectionTime || 0,
        position: position
      };

      this.learningEntries.push(entry);
      this.updateFoodPatterns(foodName, isHealthy);
      this.updateUserPatterns(entry);

      this.totalInteractions++;
      this.lastUpdated = new Date().toISOString();
      this.updateModelSize();

      this.generateInsightsSummary(entry);
    } catch (e) {
      console.error("AIModel: Error adding learning entry:", e);
    }
  }

  updateFoodPatterns(foodName, isHealthy) {
    try {
      if (!this.foodPatterns[foodName]) {
        this.foodPatterns[foodName] = {
          name: foodName,
          healthyCount: 0,
          unhealthyCount: 0,
          totalAppearances: 0,
          firstSeen: new Date().toISOString(),
          healthyConfidence: 0
        };
      }

      const pattern = this.foodPatterns[foodName];
      pattern.totalAppearances++;

      if (isHealthy) {
        pattern.healthyCount++;
      } else {
        pattern.unhealthyCount++;
      }

      const totalCount = pattern.healthyCount + pattern.unhealthyCount;
      pattern.healthyConfidence = totalCount > 0 ? pattern.healthyCount / totalCount : 0;

      pattern.lastUpdated = new Date().toISOString();
    } catch (e) {
      console.error("AIModel: Error updating food patterns:", e);
    }
  }

  updateUserPatterns(entry) {
    try {
      if (!entry) return;

      if (this.totalInteractions > 0) {
        const positionBias = entry.position === 0 ? -1 : 1;
        this.userPatterns.selectionBias =
          (this.userPatterns.selectionBias * (this.totalInteractions - 1) + positionBias) /
          this.totalInteractions;
      }

      if (this.userPatterns.lastSelectionTime && entry.selectionTime) {
        const timeDiff = entry.selectionTime - this.userPatterns.lastSelectionTime;
        this.userPatterns.averageResponseTime =
          (this.userPatterns.averageResponseTime * (this.totalInteractions - 1) + timeDiff) /
          this.totalInteractions;
      }
      this.userPatterns.lastSelectionTime = entry.selectionTime;

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

      if (this.insightsSummary.length > 5000) {
          this.insightsSummary = this.insightsSummary.substring(this.insightsSummary.length - 2500);
      }
      this.insightsSummary += `\n- ${new Date().toLocaleTimeString()}: ${insight}`;

    } catch (e) {
      console.error("AIModel: Error generating insights summary:", e);
    }
  }

  updateModelSize() {
    try {
      const serialized = JSON.stringify({
        version: this.version,
        foodPatterns: this.foodPatterns,
        userPatterns: this.userPatterns,
        totalInteractions: this.totalInteractions,
        learningEntries: this.learningEntries,
        insightsSummary: this.insightsSummary
      });

      this.modelSizeBytes = new Blob([serialized]).size;
    } catch (e) {
      console.error("AIModel: Error updating model size:", e);
      this.modelSizeBytes = 0;
    }
  }

  predictFoodHealth(foodName) {
    try {
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
      const confidence = Math.abs(healthyConf - 0.5) * 2;

      return {
        isHealthy: isHealthy,
        confidence: confidence,
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

  getTopConfidenceFoods(limit = 5) {
    try {
      const foods = Object.values(this.foodPatterns);
      if (foods.length === 0) return [];

      foods.sort((a, b) => {
        const confA = Math.abs(a.healthyConfidence - 0.5);
        const confB = Math.abs(b.healthyConfidence - 0.5);
        return confB - confA;
      });

      return foods.slice(0, limit).map(food => ({
        name: food.name,
        isHealthy: food.healthyConfidence > 0.5,
        confidence: (Math.abs(food.healthyConfidence - 0.5) * 2).toFixed(2)
      }));
    } catch (e) {
      console.error("AIModel: Error getting top confidence foods:", e);
      return [];
    }
  }

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
        this.updateModelSize();
        console.log("AIModel: State loaded successfully.");
      }
    } catch (e) {
      console.error("AIModel: Error loading state:", e);
    }
  }

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