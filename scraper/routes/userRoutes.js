const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");


router.post("/signup", userController.signUp);
router.post("/signin", userController.signIn);
router.post("/signout",authMiddleware, userController.signOut);




module.exports = router;
