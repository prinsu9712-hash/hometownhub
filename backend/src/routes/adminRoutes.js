const express = require("express");
const router = express.Router();

const { protect, authorize } = require("../middleware/authMiddleware");
const {
  getDashboardStats,
  getUsers,
  updateUserRole,
  toggleUserBlock
} = require("../controllers/adminController");

/* ==============================
   ADMIN DASHBOARD
============================== */

router.get(
  "/dashboard",
  protect,
  authorize("ADMIN"),
  getDashboardStats
);
router.get("/users", protect, authorize("ADMIN"), getUsers);
router.put("/users/:id/role", protect, authorize("ADMIN"), updateUserRole);
router.put("/users/:id/block", protect, authorize("ADMIN"), toggleUserBlock);

module.exports = router;
