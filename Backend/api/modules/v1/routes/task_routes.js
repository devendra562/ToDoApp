const express = require("express");
const router = express.Router();
const taskController = require("../controller/task_controller");

router.post("/createTask", taskController.createTask);
router.post("/getTasks", taskController.getTasks);
router.get("/getTaskById/:id", taskController.getTaskById);
router.put("/updateTask/:id", taskController.updateTask);
router.put("/markAsCompleted/:id", taskController.markAsCompleted);
router.delete("/deleteTask/:id", taskController.deleteTask);

module.exports = router;