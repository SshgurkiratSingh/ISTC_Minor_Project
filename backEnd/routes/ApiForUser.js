const express = require("express");
const router = express.Router();
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
module.exports = router;
