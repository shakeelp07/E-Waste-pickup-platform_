const mongoose = require("mongoose");

const pickupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  item: {
    type: String,
    required: true,
  },
  preferredDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ["Pending", "Scheduled", "Completed"],
    default: "Pending",
  },
});

module.exports = mongoose.model("PickupRequest", pickupSchema);
