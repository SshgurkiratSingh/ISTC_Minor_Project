const express = require("express");
const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));
const cors = require("cors");
let logs = [];
const mqtt = require("mqtt");
const client = mqtt.connect("mqtt://localhost:1883");
const fs = require("fs");
client.on("connect", () => {
  client.subscribe("IoT/room1/light1");
  client.subscribe("IoT/room1/light2");
  client.subscribe("IoT/room1/temperature");
  client.subscribe("IoT/room1/humidity");
  client.subscribe("IoT/room1/fan1");
  client.subscribe("IoT/room1/fan2");
  client.subscribe("IoT/room2/light1");
  client.subscribe("IoT/room2/light2");
  client.subscribe("IoT/room2/temperature");
  client.subscribe("IoT/room2/humidity");
  client.subscribe("IoT/room2/fan1");
  client.subscribe("IoT/garage/light1");
  client.subscribe("IoT/garage/light2");
  client.subscribe("IoT/garage/door");
  client.subscribe("IoT/garage/occupancy");
  client.subscribe("IoT/kitchen/light1");
  client.subscribe("IoT/kitchen/light2");
  client.subscribe("IoT/kitchen/switchBoard1");
  client.subscribe("IoT/kitchen/temperature");
  client.subscribe("IoT/kitchen/humidity");
  client.subscribe("IoT/kitchen/fan1");
  client.subscribe("IoT/kitchen/airQuality");
  client.subscribe("IoT/entrance/door");
  client.subscribe("IoT/entrance/light1");
  client.subscribe("IoT/entrance/light2");
  client.subscribe("IoT/entrance/rainCheck");
  client.subscribe("IoT/entrance/lightIntensity");
  client.subscribe("IoT/entrance/temperature");
  client.subscribe("IoT/hall/light1");
  client.subscribe("IoT/hall/light2");
  client.subscribe("IoT/hall/ambientLight");
  client.subscribe("IoT/hall/TV");
  client.subscribe("IoT/hall/fan1");
  client.subscribe("IoT/hall/light3");
  client.subscribe("IoT/hall/temperature");
  client.subscribe("IoT/hall/humidity");
  client.subscribe("IoT/hall/airQuality");
  client.subscribe("IoT/hall/switchBoard1");
  client.subscribe("IoT/auxiliary/tankLevel");
  client.subscribe("IoT/lawn/soilMoisture");
  client.subscribe("IoT/lawn/light1");
  client.subscribe("IoT/lawn/light2");
  client.subscribe("IoT/lawn/light3");
  client.subscribe("IoT/lawn/light4");
  client.subscribe("IoT/lawn/sunlight");
  client.subscribe("IoT/lawn/rainStatus");
  client.subscribe("IoT/lawn/soilMoisture1");
  client.subscribe("IoT/lawn/soilMoisture2");
  client.subscribe("IoT/lawn/pump1");
  client.subscribe("IoT/lawn/pump2");
  client.subscribe("IoT/lawn/autonomousMode");
  client.subscribe("IoT/lawn/autonomousLighting");
  client.subscribe("IoT/lawn/disengageIndruderDetector");
  client.subscribe("IoT/lawn/airQuality");
  client.subscribe("IoT/lawn/temperature");
  client.subscribe("IoT/lawn/humidity");
  
  client.subscribe("IoT/washroom/light1");
  client.subscribe("IoT/store/light1");
  client.subscribe("IoT/store/light2");
  client.subscribe("IoT/store/fireIndicator");
});
client.on("message", (topic, message) => {
  //   console.log(message.toString());
  //   delete previous topic data if in list
  logs = logs.filter((log) => log.topic !== topic);
  logs.push({
    topic: topic,
    value: message.toString(),
    lastUpdate: new Date().toISOString(),
  });
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
router.get("/publish", (req, res) => {
  const { value, topic } = req.query;

  console.log(topic, value);

  let messageToSend;

  if (value === "0" || value === "false" || value === false) {
    messageToSend = "0";
  } else if (value === "1" || value === "true" || value === true) {
    messageToSend = "1";
  } else if (Number(value) >= 0 && Number(value) <= 100) {
    // Fix the range condition
    messageToSend = String(value); // Convert the number to a string
  } else {
    return res.status(400).json({ message: "Bad Request" });
  }

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
    res.json({ status: "No Data Found", message: "Its empty out here" });
  }
});
function getDataByTopic(userDemand, dataArray) {
  // Filter the dataArray to find items matching the topic pattern
  const filteredData = dataArray.filter((item) => {
    const regex = new RegExp(`^IoT/${userDemand}/`);
    return regex.test(item.topic);
  });

  return filteredData;
}
module.exports = router;
