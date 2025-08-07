const express = require("express");
const router = express.Router();
const commentController = require("../controller/comment_controller");

router.post("/addComment/:id", commentController.addComment);
router.get("/getCommentsByTask/:id", commentController.getCommentsByTask);

module.exports = router;