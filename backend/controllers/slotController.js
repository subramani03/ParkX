const Slot = require("../models/Slot");

/* =========================
   ADD SLOTS (ROW / SLOT)
   ========================= */
exports.addSlots = async (req, res) => {
  try {
    const { slotNumbers } = req.body;

    if (!Array.isArray(slotNumbers) || slotNumbers.length === 0) {
      return res.status(400).json({ message: "No slots provided" });
    }

    // Normalize + build documents
    const preparedSlots = slotNumbers.map((slotNumber) => {
      const match = slotNumber.match(/^([A-Z]+)(\d+)$/i);
      if (!match) return null;

      return {
        slotNumber: match[0].toUpperCase(),
        row: match[1].toUpperCase(),
        isOccupied: false,
      };
    }).filter(Boolean);

    if (preparedSlots.length === 0) {
      return res.status(400).json({ message: "Invalid slot format" });
    }

    // Prevent duplicates
    const existingSlots = await Slot.find(
      { slotNumber: { $in: preparedSlots.map(s => s.slotNumber) } },
      { slotNumber: 1 }
    );

    const existingSet = new Set(existingSlots.map(s => s.slotNumber));

    const slotsToInsert = preparedSlots.filter(
      s => !existingSet.has(s.slotNumber)
    );

    if (slotsToInsert.length === 0) {
      return res.status(409).json({ message: "Slots already exist" });
    }

    await Slot.insertMany(slotsToInsert);

    res.status(201).json({
      message: "Slots added successfully",
      added: slotsToInsert.map(s => s.slotNumber),
    });

  } catch (err) {
    console.error("ADD SLOTS ERROR:", err);
    res.status(500).json({ message: "Failed to add slots" });
  }
};

/* =========================
   GET ALL SLOTS
   ========================= */
exports.getSlots = async (req, res) => {
  try {
    const slots = await Slot.find().sort({ row: 1, slotNumber: 1 });
    res.json(slots);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch slots" });
  }
};

/* =========================
   TOGGLE SLOT STATUS
   ========================= */
exports.toggleSlot = async (req, res) => {
  try {
    const slot = await Slot.findById(req.params.id);
    if (!slot) {
      return res.status(404).json({ message: "Slot not found" });
    }

    slot.isOccupied = !slot.isOccupied;
    await slot.save();

    res.json(slot);
  } catch (err) {
    res.status(500).json({ message: "Failed to toggle slot" });
  }
};

/* =========================
   DELETE SLOT
   ========================= */
exports.deleteSlot = async (req, res) => {
  try {
    const deleted = await Slot.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Slot not found" });
    }
    res.json({ message: "Slot removed" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete slot" });
  }
};
