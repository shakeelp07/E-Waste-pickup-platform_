const express = require("express");
const router = express.Router();
const PickupRequest = require("./models/pickup.model");

// Submit pickup request
router.post("/api/request", async (req, res) => {
  try {
    const newRequest = new PickupRequest(req.body);
    await newRequest.save();
    res.status(201).json({ message: "Pickup request submitted!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all pickup requests (for admin)
router.get("/api/requests", async (req, res) => {
  try {
    const requests = await PickupRequest.find();
    res.status(200).json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update request status
router.put("/api/requests/:id", async (req, res) => {
  try {
    const updated = await PickupRequest.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
