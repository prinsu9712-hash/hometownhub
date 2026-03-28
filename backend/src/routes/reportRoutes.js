const express = require("express");
const router = express.Router();

const { protect, authorize } = require("../middleware/authMiddleware");
const { createReport, getReports, resolveReport } = require("../controllers/reportController");

router.post("/", protect, createReport);
router.get("/", protect, authorize("ADMIN", "MODERATOR"), getReports);
router.put("/:id/resolve", protect, authorize("ADMIN", "MODERATOR"), resolveReport);

module.exports = router;
