const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const { register, login, getMe, updateMe, updateProfilePhoto } = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.put("/me", protect, updateMe);
router.put("/me/photo", protect, upload.single("profilePhoto"), updateProfilePhoto);

module.exports = router;
