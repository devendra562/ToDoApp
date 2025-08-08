const express = require("express");
const router = express.Router();
const middleware = require("../../middleware/headerValidator");

const user_routes = require("./routes/user_routes");
const task_routes = require("./routes/task_routes");
const comment_routes = require("./routes/comment_routes");
const notification_routes = require("./routes/notification_routes");

router.use("/", middleware.extractHeaderLanguage);

router.use("/", middleware.validateHeaderApiKey);

router.use("/", middleware.validateHeaderToken);

router.use("/auth", user_routes);
router.use("/tasks", task_routes);
router.use("/tasks/comments", comment_routes);
router.use("/notifications", notification_routes);

module.exports = router;