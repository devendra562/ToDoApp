const express = require("express");
const router = express.Router();
const userController = require("../controller/user_controller");

router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/getUserDetails", userController.getUserDetails);
router.get("/getUsers", userController.getUsers);

module.exports = router;