const express = require("express");
const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));
const cors = require("cors");
const fs = require("fs").promises;
// Checking Server Status
router.get("/", (req, res) => {
  res.json({
    serverStatus: "Online",
  });
});

// Checking User Validation
router.post("/validateUser", async (req, res) => {
  try {
    const fileData = await fs.readFile("dataFiles/RFID.json", "utf-8");
    const data = JSON.parse(fileData);
    if (!userRFID) {
      res.json({
        status: "error",
        Description: "no UID",
      });
    }
    const { userRFID } = req.body;

    // Check if userRFID exists in the tags array
    const user = data.tags.find((tag) => tag.UID === userRFID);

    if (user) {
      if (user.permissions == 1) {
        const logFileData = await fs.readFile(
          "dataFiles/Entrylog.json",
          "utf-8"
        );
        const entryLog = JSON.parse(logFileData);
        entryLog.push({
          UID: user.UID,
          timestamp: new Date().toISOString(),
          Description: "Entry was Approved",
          userName: user.userName,
        });
        await fs.writeFile(
          "dataFiles/Entrylog.json",
          JSON.stringify(entryLog, null, 2)
        );
        res.json({ permissionToUnlock: True, isValid: true, user: user });
      } else {
        const logFileData = await fs.readFile(
          "dataFiles/Entrylog.json",
          "utf-8"
        );
        const entryLog = JSON.parse(logFileData);
        entryLog.push({
          UID: user.UID,
          timestamp: new Date().toISOString(),
          Description: "Entry was Denied due to lack of permissions",
          userName: user.userName,
        });
        await fs.writeFile(
          "dataFiles/Entrylog.json",
          JSON.stringify(entryLog, null, 2)
        );
        res.json({ permissionToUnlock: False, isValid: true, user: user });
      }
    } else {
      const logFileData = await fs.readFile("dataFiles/Entrylog.json", "utf-8");
      const entryLog = JSON.parse(logFileData);
      entryLog.push({
        UID: userRFID,
        timestamp: new Date().toISOString(),
        Description: "Entry was Denied because of unknown card",
      });
      await fs.writeFile(
        "dataFiles/Entrylog.json",
        JSON.stringify(entryLog, null, 2)
      );
      res.json({ isValid: false });
    }
  } catch (error) {
    console.error("Error reading or parsing JSON file:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// Validating user using get request
router.get("/validateUser/:UID", async (req, res) => {
  const fileData = await fs.readFile("dataFiles/RFID.json", "utf-8");
  const data = JSON.parse(fileData);
  const { UID } = req.params;
  // Check if userRFID exists in the tags array
  const user = data.tags.find((tag) => tag.UID === UID);

  if (user) {
    if (user.permissions == 1) {
      res.json({ permissionToUnlock: True, isValid: true, user: user });
    } else {
      res.json({ permissionToUnlock: False, isValid: true, user: user });
    }
  } else {
    res.json({ isValid: false });
  }
});
// adding User using Post request
router.post("/addUser", async (req, res) => {
  try {
    const fileData = await fs.readFile("dataFiles/RFID.json", "utf-8");
    const data = JSON.parse(fileData);

    const { UID, userType, userName, email, permissions, userDescription } =
      req.body;
    // Check if userRFID exists in the tags array
    const user = data.tags.find((tag) => tag.UID === userRFID);

    if (user) {
      res.json({
        message: "User already exists",
        user: user,
      });
    } else {
      data.tags.push({
        UID: UID,
        userName: userName,
        userType: userType,
        userDescription: userDescription,
        permissions: permissions,
        email: email,
      });
      await fs.writeFile("dataFiles/RFID.json", JSON.stringify(data));
      res.json({
        message: "User added successfully",
        user: data.tags.find((tag) => tag.UID === userRFID),
      });
    }
  } catch (error) {
    console.error("Error reading or parsing JSON file:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// Get all User List
router.get("/getAllUser", async (req, res) => {
  const fileData = await fs.readFile("dataFiles/RFID.json", "utf-8");
  const data = JSON.parse(fileData);
  res.json(fileData);
});

module.exports = router;
