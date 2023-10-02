const express = require("express");
const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));
const cors = require("cors");
const EntryCache = require("../CustomModule/cacheManager");
const fs = require("fs").promises;
// Checking Server Status
router.get("/", async (req, res) => {
  // await EntryCache.updateCache("entryLog");
  res.json({
    serverStatus: "Online",
  });
});

// Checking User Validation
router.post("/validateUser", async (req, res) => {
  try {
    const fileData = await fs.readFile("dataFiles/RFID.json", "utf-8");
    const data = JSON.parse(fileData);
    console.log(req.body);

    // Check if UID exists in the request body
    if (!req.body.UID) {
      return res.json({
        status: "error",
        description: "No UID provided",
        code: 400,
      });
    }

    const { UID, nodeLocation } = req.body;

    // Check if UID exists in the tags array (case-insensitive)
    const user = data.tags.find(
      (tag) =>
        tag.UID.toLowerCase().split(" ").join("") ===
        UID.toLowerCase().split(" ").join("")
    );

    const logFileData = await fs.readFile("dataFiles/Entrylog.json", "utf-8");
    const entryLog = JSON.parse(logFileData);
    const timestamp = new Date().toISOString();

    if (user) {
      if (user.permissions == true) {
        // Handle entry approval logic
        entryLog.push({
          UID: user.UID,
          timestamp,
          description: "Entry was Approved",
          status: "approved",
          userName: user.userName,
          nodeLocation,
        });

        await fs.writeFile(
          "dataFiles/Entrylog.json",
          JSON.stringify(entryLog, null, 2)
        );
        await EntryCache.updateCache("entryLog");

        return res.json({
          permissionToUnlock: true,
          isValid: true,
          ...user,
          nodeLocation,
          timestamp,
          code: 1, // Status code for entry approved
        });
      } else {
        // Handle entry denial logic
        entryLog.push({
          UID: user.UID,
          timestamp,
          nodeLocation,
          description: "Entry was Denied due to lack of permissions",
          status: "denied",
          userName: user.userName,
        });

        await fs.writeFile(
          "dataFiles/Entrylog.json",
          JSON.stringify(entryLog, null, 2)
        );
        await EntryCache.updateCache("entryLog");

        return res.json({
          permissionToUnlock: false,
          isValid: true,
          nodeLocation,
          ...user,
          timestamp,
          code: 2, // Status code for entry denied
        });
      }
    } else {
      // Handle unknown card logic
      entryLog.push({
        UID: UID,
        nodeLocation,
        timestamp,
        description: "Entry was Denied because of an unknown card",
        status: "unknown",
      });

      await fs.writeFile(
        "dataFiles/Entrylog.json",
        JSON.stringify(entryLog, null, 2)
      );

      await EntryCache.updateCache("entryLog");
      return res.json({
        isValid: false,
        nodeLocation,
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
