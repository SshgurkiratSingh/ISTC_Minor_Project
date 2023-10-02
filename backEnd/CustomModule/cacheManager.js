// cacheManager.js
const fs = require("fs").promises;
const path = require("path");

class CacheManager {
  constructor(config = {}) {
    this.cache = {};
    this.counts = {};
    this.config = {
      cacheUpdateThreshold: 60, // Default value
      ...config,
    };
  }

  async getCache(key) {
    this.counts[key] = (this.counts[key] || 0) + 1;
    if (this.counts[key] >= this.config.cacheUpdateThreshold) {
      await this.updateCache(key);
      this.counts[key] = 0;
    }
    return this.cache[key];
  }

  setCache(key, data) {
    this.cache[key] = {
      data,
      lastUpdated: new Date().toISOString(),
    };
    console.log("Cache set for key: " + key);
  }

  isCacheValid(key, validityPeriod) {
    const cacheEntry = this.cache[key];
    if (!cacheEntry) return false;

    const now = new Date();
    const lastUpdated = new Date(cacheEntry.lastUpdated);
    const age = now - lastUpdated;

    return age < validityPeriod;
  }

  async updateCache(key) {
    try {
      const filePath = this.getFilePathForKey(key);
      if (!filePath) {
        console.log(`No file path defined for key: ${key}`);
      }
      const fileData = await fs.readFile(filePath, "utf-8");
      if (key == "entryLog") {
        this.setCache(key, JSON.parse(fileData).splice(-10));
      } else {
        this.setCache(key, JSON.parse(fileData));
      }
      console.log(`Cache updated for key: ${key}`);
    } catch (error) {
      console.error("Error updating cache:", error);
    }
  }

  getFilePathForKey(key) {
    const filePaths = {
      entryLog: path.resolve(__dirname, "../dataFiles/Entrylog.json"),
    };
    return filePaths[key];
  }
}

const cacheConfig = {
  cacheUpdateThreshold: 60, // You can configure the threshold here
};

const EntryCache = new CacheManager(cacheConfig);

module.exports = EntryCache;
