const Parking = require("../models/Parking");

/* =========================
   GET ANALYTICS DATA
   ========================= */
exports.getAnalytics = async (req, res) => {
  try {
    const sessions = await Parking.find()
      .sort({ entryTime: -1 })
      .lean();

    res.json(sessions);
  } catch (error) {
    console.error("Analytics Error:", error);
    res.status(500).json({ message: "Failed to load analytics data" });
  }
};
