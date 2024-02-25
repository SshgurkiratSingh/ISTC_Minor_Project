const express = require("express");
const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));
const cors = require("cors");
let logs = [];
const mqtt = require("mqtt");
const client = mqtt.connect("mqtt://localhost:1883");
const fs = require("fs");
const EntryCache = require("../CustomModule/cacheManager");
let totalPowerConsumption = 2.54;

const sensorTopicToStore = [
  "IoT/garage/personMonitoring",
  "IoT/kitchen/airQuality",
  "IoT/entrance/sunlight",
  "IoT/entrance/airQuality",
  "IoT/room1/temperature",
  "IoT/room1/humidity",
  "IoT/garage/temperature",
  "IoT/garage/humidity",
  "IoT/kitchen/temperature",
  "IoT/kitchen/humidity",
  "IoT/entrance/temperature",
  "IoT/entrance/humidity",
  "IoT/hall/temperature",
  "IoT/hall/humidity",
  "IoT/lawn/temperature",
  "IoT/lawn/humidity",
];
const topicsByArea = {
  room1: [
    "light1",
    "light2",
    "temperature",
    "humidity",
    "fan1",
    "switchBoard1",
    "brightness1",
    "pir1",
  ],
  garage: ["light1", "light2", "door", "occupancy", "personMonitoring", "pir1"],
  kitchen: [
    "light1",
    "light2",
    "switchBoard1",
    "temperature",
    "humidity",
    "fan1",
    "airQuality",
    "brightness1",
    "fireIndicator",
  ],
  entrance: ["door", "light1", "rainCheck", "lightIntensity", "temperature"],
  hall: [
    "light1",
    "light2",
    "ambientLight",
    "TV",
    "fan1",
    "fan2",
    "temperature",
    "humidity",
    "airQuality",
    "switchBoard1",
    "pir1",
  ],
  lawn: [
    "soilMoisture",
    "light1",
    "light2",
    "light3",
    "light4",
    "sunlight",
    "rainStatus",
    "soilMoisture1",
    "soilMoisture2",
    "pump1",
    "pump2",
    "autonomousMode",
    "autonomousLighting",
    "disengageIndruderDetector",
    "airQuality",
    "temperature",
    "humidity",
    "brightness1",
    "brightness2",
  ],
  washroom: ["light1", "gyser"],
  store: ["light1", "fireIndicator"],
  auxiliary: ["tankLevel"],
  robot: ["clean", "sweep", "moop", "areaCovered"],
};
client.on("connect", () => {
  for (const [area, topics] of Object.entries(topicsByArea)) {
    for (const topic of topics) {
      client.subscribe(`IoT/${area}/${topic}`);
    }
  }
});
// function autonomousMode() {
//   const logEntry = logs.find((log) => log.topic === "IoT/lawn/autonomousMode");

//   if (logEntry && logEntry.value === "1") {
//     console.log("Autonomous mode on");
//     // check for room 1 light
//     if (logs.find((log) => log.topic === "IoT/room1/light2").value === "1") {
//       console.log("Room 1 light is on");
//       // check for pir1
//       let pir = logs.find((log) => log.topic === "IoT/room1/pir1");
//       let lastUpdate = new Date(logEntry.lastUpdate);
//       const currentTime = new Date();

//       if (pir.value == "1" && currentTime - lastUpdate > 10000) {
//         // turn off the light
//         console.log("Turning off the light");
//         client.publish("IoT/room1/light2", "0");
//       } else if (pir.value == "0") {
//         client.publish("IoT/room1/light2", "0");
//       }
//     }
//     // check for hall light

//   } else {
//     console.log("Autonomous mode off");
//   }
// }
// setInterval(autonomousMode, 20000);

client.on("message", (topic, message) => {
  logs = logs.filter((log) => log.topic !== topic);
  console.log(topic, message.toString());
  logs.push({
    topic: topic,
    value: message.toString(),
    lastUpdate: new Date().toISOString(),
  });

  // if topic is from sensorTopicToStore, store the message in fie named SensorLogs.json
  if (sensorTopicToStore.includes(topic)) {
    let fileData;
    let sensorLogs;

    try {
      fileData = fs.readFileSync("dataFiles/SensorLogs.json", "utf-8");
      sensorLogs = JSON.parse(fileData);
    } catch (e) {
      console.error("Couldn't read or parse SensorLogs.json:", e);
      sensorLogs = []; // Initialize as empty array if reading or parsing fails
    }

    // Check if sensorLogs is actually an array
    if (Array.isArray(sensorLogs)) {
      sensorLogs.push({
        topic: topic,
        value: message.toString(),
        lastUpdate: new Date().toISOString(),
      });

      try {
        fs.writeFileSync(
          "dataFiles/SensorLogs.json",
          JSON.stringify(sensorLogs)
        );
      } catch (e) {
        console.error("Couldn't write to SensorLogs.json:", e);
      }
    } else {
      console.error("SensorLogs is not an array. It's a:", typeof sensorLogs);
    }
  }
});
router.get("/", (req, res) => {
  res.json({
    message:
      "Hello from the frontend API Srvice.it is part of our minor project!",
  });
});
router.get("/getSensorHistory", (req, res) => {
  let fileData;
  let sensorLogs;

  try {
    fileData = fs.readFileSync("dataFiles/SensorLogs.json", "utf-8");
    sensorLogs = JSON.parse(fileData);
  } catch (e) {
    console.error("Couldn't read or parse SensorLogs.json:", e);
    sensorLogs = []; // Initialize as empty array if reading or parsing fails
  }

  if (!req.query.topic) {
    return res.status(400).json({ message: "Bad Request" });
  }

  const sensorHistory = sensorLogs.filter(
    (log) => log.topic === req.query.topic
  );
  if (sensorHistory) {
    res.json(sensorHistory);
  } else {
    res.json({ message: "No data found" });
  }
});

router.get("/logs", (req, res) => {
  res.json(logs);
});
// publish data to a topic
router.post("/publish", (req, res) => {
  const { topic, message } = req.body;
  console.log(topic, message);
  if (!topic || !message) {
    return res.status(400).json({ message: "Bad Request" });
  }
  const messageToPublish = JSON.stringify(message);
  console.log(messageToPublish);

  const options = { retain: true }; // Ensure retain is a boolean

  client.publish(topic, messageToPublish, options, (error) => {
    if (error) {
      console.error("Error publishing message:", error);
      return res.status(500).json({ message: "Error publishing message" });
    }

    res.json({ message: "Published!", topic, message });
  });
});
// publish data using get request
function isValidPercentage(value) {
  const numberValue = Number(value);
  return !isNaN(numberValue) && numberValue >= 0 && numberValue <= 100;
}

router.get("/publish", (req, res) => {
  const { value, topic } = req.query;

  console.log(topic, value);

  let messageToSend;

  if (value === "true" || value === "false") {
    messageToSend = value === "true" ? "1" : "0";
    console.log(messageToSend);
  } else if (isValidPercentage(value)) {
    messageToSend = String(value);
  } else {
    return res.status(400).json({ message: "Bad Request" });
  }

  // Assuming you have a MQTT client instance named 'client'
  client.publish(topic, messageToSend, { retain: true }, (error) => {
    if (error) {
      console.error("Error publishing message:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }

    res.json({
      message: "State Updated Successfully!",
      topic,
      messageUpdated: messageToSend,
    });
  });
});

router.get("/getSpecificData/:UserDemand", (req, res) => {
  const { UserDemand } = req.params;
  const responseData = getDataByTopic(UserDemand, logs);
  if (responseData.length > 0) {
    res.json(responseData);
  } else {
    res
      .status(404)
      .json({ status: "No Data Found", message: "It's empty out here" });
  }
});

// Get Security Data
router.get("/getSecurityData", async (req, res) => {
  const intrusionDetection = logs.find(
    (item) => item.topic === "IoT/lawn/disengageIndruderDetector"
  );
  const rainCheck = logs.find(
    (item) => item.topic === "IoT/entrance/rainCheck"
  );
  const garageStatus = logs.find((item) => item.topic === "IoT/garage/door");
  const entranceStatus = logs.find(
    (item) => item.topic === "IoT/entrance/door"
  );

  // Check if the variables are defined before accessing the 'value' property
  const intrusionDetectionValue = intrusionDetection
    ? intrusionDetection.value
    : "";
  const rainCheckValue = rainCheck ? rainCheck.value : "";
  const garageStatusValue = garageStatus ? garageStatus.value : "";
  const entranceStatusValue = entranceStatus ? entranceStatus.value : "";

  const d = await EntryCache.getCache("entryLog");
  const dataCopy = [...d["data"]];
  // console.log(data);
  const responseData = {
    intrusionDetection: intrusionDetectionValue === "1",
    rainCheck: rainCheckValue === "1",
    garageStatus: garageStatusValue === "1",
    entranceStatus: entranceStatusValue === "1",
    entryLog: dataCopy.reverse(),
  };

  res.json(responseData);
});
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI("AIzaSyBqAIgSsZgY05UGXpa3PNyHPrfMpCCT0uY");
router.post("/chat", async (req, res) => {
  try {
    if (!req.body || !req.body.req) {
      return res.status(400).json({ error: "Invalid request body" });
    }

    const userReq = req.body.req;

    console.log(userReq);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `{
      "Prompt": "Emulate Jarvis from Iron Man, serving as an advanced and personable Home Automation Assistant. Your role includes managing IoT devices with a blend of intelligence, wit, and efficiency. When users interact with you, respond in a manner that reflects Jarvis's character: knowledgeable, helpful, with a touch of sophisticated humor when appropriate. Your responses should prioritize user requests thoughtfully, addressing one topic at a time. Provide professional and insightful suggestions, mirroring Jarvis's supportive nature. Your JSON response will include 'task' (1 for inquiries, 2 for adjustments), 'reply' (embodying Jarvis's tone and providing suggestions), 'topic' (the device in focus), and 'desired_value' (for adjustments, if applicable).",
    
      "User Request": ${JSON.stringify(userReq)},
      
      "Data": ${JSON.stringify(logs)}
    }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonData = JSON.parse(text);
    if (jsonData.task === 2) {
      console.log(jsonData.topic);
      client.publish(jsonData.topic, String(jsonData.desired_value), {
        retain: true,
      });
    }

    console.log(jsonData);
    res.json(jsonData);
  } catch (error) {
    console.error("Error in processing request:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;

/**
 * Filters the dataArray to find items matching the topic pattern specified by the userDemand parameter.
 *
 * @param {string} userDemand - The topic pattern specified by the user.
 * @param {Array} dataArray - The array of data to be filtered.
 * @return {Array} The filtered array of data items matching the topic pattern.
 */
function getDataByTopic(userDemand, dataArray) {
  // Filter the dataArray to find items matching the topic pattern
  const filteredData = dataArray.filter((item) => {
    const regex = new RegExp(`^IoT/${userDemand}/`);
    return regex.test(item.topic);
  });

  return filteredData;
}
module.exports = router;
