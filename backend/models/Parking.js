const mongoose = require("mongoose");

const parkingSchema = new mongoose.Schema({
  vehicleNumber: String,
  phone: String,
  slotNumber: String,
  qrData: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Parking", parkingSchema);
