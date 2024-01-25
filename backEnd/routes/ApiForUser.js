const express = require("express");
const router = express.Router();
const mqtt = require("mqtt");
const fs = require("fs");

router.use(express.json());
router.use(express.urlencoded({ extended: true }));
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

router.post("/add-entry", async (req, res) => {
  try {
    const {
      boardNo,
      nsPairNo,
      ewPairNo,
      contract,
      by,
      result,
      nsScore,
      ewScore,
    } = req.body;

    // Detailed validation
    const fields = {
      boardNo,
      nsPairNo,
      ewPairNo,
      contract,
      by,
      result,
      nsScore,
      ewScore,
    };
    for (const [key, value] of Object.entries(fields)) {
      if (value === undefined || value === null) {
        return res
          .status(400)
          .json({ error: `Missing required field: ${key}` });
      }
      // Add more specific validations here if needed
    }

    const newEntry = await prisma.entry.create({
      data: fields,
    });

    res.json(newEntry);
  } catch (error) {
    console.error("Failed to add entry:", error);
    res.status(500).json({ error: "Server error" }); // Include the error message and a 500 status code
  }
});
router.post("/edit-entry", async (req, res) => {
  try {
    const {
      id,
      boardNo,
      nsPairNo,
      ewPairNo,
      contract,
      by,
      result,
      nsScore,
      ewScore,
    } = req.body;

    // Detailed validation
    const fields = {
      boardNo,
      nsPairNo,
      ewPairNo,
      contract,
      by,
      result,
      nsScore,
      ewScore,
    };
    for (const [key, value] of Object.entries(fields)) {
      if (value === undefined || value === null) {
        return res
          .status(400)
          .json({ error: `Missing required field: ${key}` });
      }
      // Add more specific validations here if needed
    }

    const updatedEntry = await prisma.entry.update({
      where: { id },
      data: {
        boardNo: parseInt(boardNo),
        nsPairNo: parseInt(nsPairNo),
        ewPairNo: parseInt(ewPairNo),
        result,
        contract,
        by,
        nsScore: parseInt(nsScore),
        ewScore: parseInt(ewScore),
      },
    });

    res.json({ msg: "Entry updated successfully" });
  } catch (error) {
    console.error("Failed to update entry:", error);
    res.status(500).json({ error: "Server error" }); // Include the error message and a 500 status code
  }
});
router.post("/delete-entry", async (req, res) => {
  try {
    const { id } = req.body;

    if (!id || typeof id !== "string") {
      return res.status(400).json({ msg: "Missing required field: id" });
    }

    const deletedEntry = await prisma.entry.delete({
      where: { id },
    });

    res.json({ msg: "Entry deleted successfully" });
  } catch (error) {
    console.error("Failed to delete entry:", error);
    res.status(500).json({ error: "Server error" }); // Include the error message and a 500 status code
  }
});
router.get("/get-entries", async (req, res) => {
  try {
    const entries = await prisma.entry.findMany();

    // Sending response with entries and a random number
    res
      .set("Cache-Control", "no-store, max-age=0")
      .json({ entries, rand: Math.random() });
  } catch (error) {
    console.error("Failed to get entries:", error);
    // Sending a 500 internal server error response
    res.status(500).send("Internal Server Error");
  }
});
// function to get uid and store it in variable
let uidLogs = [];
router.post("/add", async (req, res) => {
  try {
    const { uid } = req.body;
    uidLogs.push({ timestamp: new Date(), uid });
    res.json({ msg: "UID added successfully" });
  } catch (error) {
    console.error("Failed to add UID:", error);
    res.status(500).json({ error: "Server error" }); // Include the error message and a 500 status code
  }
});
router.get("/get-uid", async (req, res) => {
  try {
    res.json({ uidLogs });
  } catch (error) {
    console.error("Failed to get UID:", error);
    res.status(500).json({ error: "Server error" }); // Include the error message and a 500 status code
  }
});
router.get("/startLogging", async (req, res) => {
  try {
    // Check if logging is already active
    if (isLoggingActive) {
      res.status(400).json({ msg: "Logging is already in progress." });
    } else {
      await startMqttLogging();
      res.json({ msg: "MQTT logging started for the next hour." });
    }
  } catch (error) {
    console.error("Failed to start logging:", error);
    res.status(500).json({ error: "Server error" });
  }
});

const mqttClient = mqtt.connect("mqtt://localhost:1883");
const topics = [
  "IoT/hall/temperature",
  "IoT/hall/humidity",
  "IoT/hall/light1",
  "IoT/hall/light2",
  "IoT/hall/fan1",
  "IoT/hall/fan2",
  "IoT/hall/switchBoard1",
  "IoT/hall/ambientLight",
  "IoT/hall/automationTriggered",
];

let isLoggingActive = false;
let data = {
  deviceDurations: {},
  temperatures: [],
  humidities: [],
  automationTriggersCount: 0,
};

// Initialize duration tracking for each light and fan
topics.forEach((topic) => {
  if (topic.includes("light") || topic.includes("fan")) {
    data.deviceDurations[topic] = {
      lastChanged: null,
      onDuration: 0,
      offDuration: 0,
      lastState: null,
    };
  }
});

function calculateDuration(topic, state) {
  const now = new Date();
  if (data.deviceDurations[topic].lastChanged !== null) {
    const duration = (now - data.deviceDurations[topic].lastChanged) / 1000; // seconds
    data.deviceDurations[topic][state ? "onDuration" : "offDuration"] +=
      duration;
  }
  data.deviceDurations[topic].lastChanged = now;
  data.deviceDurations[topic].lastState = state;
}

// Function to process MQTT messages
function processMessage(topic, message) {
  if (topic.includes("temperature")) {
    data.temperatures.push(parseFloat(message));
  } else if (topic.includes("humidity")) {
    data.humidities.push(parseFloat(message));
  } else if (topic.includes("automationTriggered")) {
    data.automationTriggersCount++;
  } else if (topic.includes("light") || topic.includes("fan")) {
    const state = message.toString() === "on";
    calculateDuration(topic, state);
  }
}

// Compute statistics for temperatures and humidities
function computeStatistics() {
  const tempStats = data.temperatures.length
    ? {
        average:
          data.temperatures.reduce((a, b) => a + b, 0) /
          data.temperatures.length,
        min: Math.min(...data.temperatures),
        max: Math.max(...data.temperatures),
      }
    : {};

  const humidityStats = data.humidities.length
    ? {
        average:
          data.humidities.reduce((a, b) => a + b, 0) / data.humidities.length,
        min: Math.min(...data.humidities),
        max: Math.max(...data.humidities),
      }
    : {};

  return { temperatureStats: tempStats, humidityStats: humidityStats };
}

// Function to start logging MQTT data
async function startMqttLogging() {
  if (isLoggingActive) return;
  isLoggingActive = true;

  // Subscribe to multiple topics
  topics.forEach((topic) => {
    mqttClient.subscribe(topic, (err) => {
      if (err) console.error(`Failed to subscribe to topic ${topic}`, err);
    });
  });

  // MQTT message event
  mqttClient.on("message", (topic, message) => {
    processMessage(topic, message.toString());
  });

  // Stop logging after an hour
  setTimeout(() => {
    topics.forEach((topic) => {
      if (topic.includes("light") || topic.includes("fan")) {
        // Final duration calculation for ongoing states
        calculateDuration(topic, data.deviceDurations[topic].lastState);
      }
      mqttClient.unsubscribe(topic);
    });
    mqttClient.removeAllListeners("message");

    const stats = computeStatistics();
    const finalData = { ...data, ...stats };

    fs.writeFile("mqttData.json", JSON.stringify(finalData, null, 2), (err) => {
      if (err) throw err;
      console.log("MQTT data saved to mqttData.json");
    });
    isLoggingActive = false;
  }, 3600000); // 1 hour in milliseconds
}
router.get("/getReport", async (req, res) => {
  try {
    // Attempt to read file
    const fileData = await fs.readFile("mqttData.json", "utf-8");

    // Attempt to parse JSON
    const data = JSON.parse(fileData);

    // Send the parsed data as JSON response
    res.json(data);
  } catch (error) {
    // Handle errors
    console.error("Error reading or parsing JSON file:", error);

    // Send an error response
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
