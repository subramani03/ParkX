const mongoose = require("mongoose");

const parkingSchema = new mongoose.Schema({
  vehicleNumber: String,
  phone: String,
  slotNumber: String,

  entryTime: {
    type: Date,
    default: Date.now,
  },

  exitTime: {
    type: Date,
    default: null,
  },

  durationMinutes: Number,
  amount: Number,
});

module.exports = mongoose.model("Parking", parkingSchema);

