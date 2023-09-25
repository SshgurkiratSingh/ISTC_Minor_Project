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

    // Check if userRFID exists in the request body
    if (!req.body.userRFID) {
      return res.json({
        status: "error",
        description: "No UID provided",
        code: 400,
      });
    }

    const { userRFID } = req.body;

    // Check if userRFID exists in the tags array (case-insensitive)
    const user = data.tags.find(
      (tag) => tag.UID.toLowerCase() === userRFID.toLowerCase()
    );

    const logFileData = await fs.readFile("dataFiles/Entrylog.json", "utf-8");
    const entryLog = JSON.parse(logFileData);
    const timestamp = new Date().toISOString();

    if (user) {
      if (user.permissions === 1) {
        // Handle entry approval logic
        entryLog.push({
          UID: user.UID,
          timestamp,
          description: "Entry was Approved",
          status: "approved",
          userName: user.userName,
        });

        await fs.writeFile(
          "dataFiles/Entrylog.json",
          JSON.stringify(entryLog, null, 2)
        );

        return res.json({
          permissionToUnlock: true,
          isValid: true,
          ...user,
          timestamp,
          code: 1, // Status code for entry approved
        });
      } else {
        // Handle entry denial logic
        entryLog.push({
          UID: user.UID,
          timestamp,
          description: "Entry was Denied due to lack of permissions",
          status: "denied",
          userName: user.userName,
        });

        await fs.writeFile(
          "dataFiles/Entrylog.json",
          JSON.stringify(entryLog, null, 2)
        );

        return res.json({
          permissionToUnlock: false,
          isValid: true,
          ...user,
          timestamp,
          code: 2, // Status code for entry denied
        });
      }
    } else {
      // Handle unknown card logic
      entryLog.push({
        UID: userRFID,
        timestamp,
        description: "Entry was Denied because of an unknown card",
        status: "unknown",
      });

      await fs.writeFile(
        "dataFiles/Entrylog.json",
        JSON.stringify(entryLog, null, 2)
      );

      return res.json({
        isValid: false,
        timestamp,
        code: 3, // Status code for unknown card
      });
    }
  } catch (error) {
    console.error("Error reading or parsing JSON file:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// adding User using Post request

router.post("/addUser", async (req, res) => {
  try {
    // Validate user input
    const { UID, userType, userName, email, permissions, userDescription } =
      req.body;

    if (!UID || !userType || !userName || !email) {
      return res.status(400).json({ error: "Invalid user data" });
    }

    const fileData = await fs.readFile("dataFiles/RFID.json", "utf-8");
    const data = JSON.parse(fileData);

    // Check if userUID exists in the tags array
    const user = data.tags.find((tag) => tag.UID === UID);

    if (user) {
      return res.status(409).json({
        error: "User already exists",
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

      // Write updated data back to the file
      await fs.writeFile("dataFiles/RFID.json", JSON.stringify(data));

      return res.status(201).json({
        message: "User added successfully",
        user: data.tags.find((tag) => tag.UID === UID),
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
