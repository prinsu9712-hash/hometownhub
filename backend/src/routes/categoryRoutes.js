const express = require("express");
const router = express.Router();

const { protect, authorize } = require("../middleware/authMiddleware");
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} = require("../controllers/categoryController");

router.get("/", protect, getCategories);
router.post("/", protect, authorize("ADMIN"), createCategory);
router.put("/:id", protect, authorize("ADMIN"), updateCategory);
router.delete("/:id", protect, authorize("ADMIN"), deleteCategory);

module.exports = router;
