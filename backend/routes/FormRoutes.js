const express = require("express");
const router = express.Router();
const { Forms } = require("../models/model");

// Route to save form data
router.post("/submit", async (req, res) => {
  try {
    const formData = Forms(req.body); // Assuming `Form` is your Mongoose model
    console.log(req.body);
    await formData.save();
    res.status(201).json({ message: "Form data saved successfully!" });
  } catch (err) {
    console.error("Error saving form data:", err.message);
    res.status(500).json({ error: "Failed to save form data" });
  }
});

module.exports = router;
