const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  createOnboarding,
  getOnboarding,
  updateOnboardingStatus
} = require("../controllers/onboardingController");

router.post("/", protect, createOnboarding);
router.get("/", protect, getOnboarding);
router.put("/:id/status", protect, authorize("ADMIN"), updateOnboardingStatus);

module.exports = router;
