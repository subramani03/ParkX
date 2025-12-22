const express = require("express");
const {
  addSlots,
  getSlots,
  toggleSlot,
  deleteSlot
} = require("../controllers/slotController");

const router = express.Router();

router.post("/add", addSlots);
router.get("/", getSlots);
router.put("/toggle/:id", toggleSlot);
router.delete("/:id", deleteSlot);

module.exports = router;
