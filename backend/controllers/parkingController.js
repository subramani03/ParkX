const Slot = require("../models/Slot");
const Parking = require("../models/Parking");
const generateQR = require("../utils/qrGenerator");

const validateVehicle = (num) => {
  if (!num) return false;

  const value = num.toUpperCase().trim();

  // Indian vehicle number formats:
  // TN01AB1234
  // KA5MK9876
  // MH12DE1433
  const indianRegex = /^[A-Z]{2}\d{1,2}[A-Z]{1,2}\d{4}$/;

  // Generic fallback (commercial / temporary / custom plates)
  const genericRegex = /^[A-Z0-9]{6,12}$/;

  return indianRegex.test(value) || genericRegex.test(value);
};

const validatePhone = (phone) => /^[6-9]\d{9}$/.test(phone);

/* GET ALL SLOTS */
exports.getSlots = async (req, res) => {
  const slots = await Slot.find().sort({ slotNumber: 1 });
  res.json(slots);
};

/* ADD SLOT (manual admin use) */
exports.addSlot = async (req, res) => {
  const { slotNumber } = req.body;
  const slot = await Slot.create({ slotNumber });
  res.json(slot);
};

exports.parkVehicle = async (req, res) => {
  try {
    const { vehicleNumber, phone, slotNumber } = req.body;

    if (!vehicleNumber || !phone || !slotNumber) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!validateVehicle(vehicleNumber)) {
      return res.status(400).json({ message: "Invalid vehicle number format" });
    }

    if (!validatePhone(phone)) {
      return res.status(400).json({ message: "Invalid phone number" });
    }

    const slot = await Slot.findOne({ slotNumber });
    if (!slot) return res.status(404).json({ message: "Slot not found" });

    if (slot.isOccupied) {
      return res.status(409).json({ message: "Slot already occupied" });
    }

    const activeParking = await Parking.findOne({
      vehicleNumber,
      exitTime: null,
    });

    if (activeParking) {
      return res.status(400).json({ message: "Vehicle already parked" });
    }

    slot.isOccupied = true;
    slot.vehicleNumber = vehicleNumber.toUpperCase().trim();
    await slot.save();

    const parking = await Parking.create({
      vehicleNumber: vehicleNumber.toUpperCase().trim(),
      phone: phone.trim(),
      slotNumber,
      entryTime: new Date(),
    });

    const qrImage = await generateQR(slotNumber);

    res.status(201).json({
      message: "Parking successful",
      bill: parking,
      qrImage,
    });
  } catch (error) {
    console.error("Park Error:", error);
    res.status(500).json({ message: "Server error during parking" });
  }
};

/* ---------------- RELEASE SLOT ---------------- */
// exports.releaseSlot = async (req, res) => {
//   try {
//     const { slotNumber } = req.body;

//     const slot = await Slot.findOne({ slotNumber });
//     if (!slot) return res.status(404).json({ message: "Invalid slot" });

//     if (!slot.isOccupied) {
//       return res.status(400).json({ message: "Slot already vacant" });
//     }

//     slot.isOccupied = false;
//     await slot.save();

//     const parking = await Parking.findOne({
//       slotNumber,
//       exitTime: null,
//     }).sort({ entryTime: -1 });

//     if (parking) {
//       parking.exitTime = new Date();
//       await parking.save();
//     }

//     res.json({
//       message: `Slot ${slotNumber} released successfully`,
//       session: parking,
//     });
//   } catch (error) {
//     console.error("Release Error:", error);
//     res.status(500).json({ message: "Server error during release" });
//   }
// };


exports.releaseSlot = async (req, res) => {
  try {
    const { slotNumber } = req.body;

    const slot = await Slot.findOne({ slotNumber });
    if (!slot) {
      return res.status(404).json({ message: "Invalid slot" });
    }

    if (!slot.isOccupied) {
      return res.status(400).json({ message: "Slot already vacant" });
    }

    // 🔹 Find active parking session
    const parking = await Parking.findOne({
      slotNumber,
      exitTime: null,
    }).sort({ entryTime: -1 });

     const parkingData = await Parking.findOne();
     console.log(parkingData)

    if (!parking) {
      return res.status(404).json({ message: "Parking session not found" });
    }

    // 🔹 Exit time
    parking.exitTime = new Date();

    // 🔹 Duration calculation (minutes)
    const durationMs = parking.exitTime - parking.entryTime;
    const durationMinutes = Math.ceil(durationMs / (1000 * 60));
    parking.durationMinutes = durationMinutes;

    // 🔹 Price calculation (example rule)
    // ₹2 per hour (minimum 1 hour)
    const days = Math.ceil(durationMinutes / 1440);
    parking.amount = days * 20;

    await parking.save();

    // 🔹 Free slot
    slot.isOccupied = false;
    slot.vehicleNumber = null;
    await slot.save();

    res.json({
      message: `Slot ${slotNumber} released successfully`,
      bill: parking,
    });
  } catch (error) {
    console.error("Release Error:", error);
    res.status(500).json({ message: "Server error during release" });
  }
};

