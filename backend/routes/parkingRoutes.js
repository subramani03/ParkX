const express = require("express");
const router = express.Router();
const controller = require("../controllers/parkingController");

router.get("/slots", controller.getSlots);
router.post("/slots", controller.addSlot);

router.post("/park", controller.parkVehicle);
router.post("/release", controller.releaseSlot);
// router.post("/generate", controller.generateQR);

module.exports = router;
