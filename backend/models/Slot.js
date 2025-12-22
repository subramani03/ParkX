const mongoose = require("mongoose");

const slotSchema = new mongoose.Schema({
  slotNumber: {
    type: String,
    required: true,
    unique: true, // IMPORTANT
  },
  row: {
    type: String,
    required: true,
    index: true,
  },
  isOccupied: {
    type: Boolean,
    default: false,
  },
  vehicleNumber: {
    type: String,
    default: null,
  },
});

module.exports = mongoose.model("Slot", slotSchema);
