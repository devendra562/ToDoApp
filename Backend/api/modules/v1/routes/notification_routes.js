const express = require("express");
const router = express.Router();
const notificationController = require("../controller/notification_controller");

router.post("/createNotification", notificationController.createNotification);
router.get("/getNotificationsByUser", notificationController.getNotificationsByUser);
router.put("/markAsRead/:id", notificationController.markAsRead);
router.delete("/deleteNotification/:id", notificationController.deleteNotification);

module.exports = router;