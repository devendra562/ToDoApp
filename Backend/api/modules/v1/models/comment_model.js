const common = require("../../../config/common");
const lang = require("../../../config/language");
const Codes = require("../../../config/status_codes");
const commentSchema = require("../../schema/comment_schema");

const comment_model = {
    //////////////////////////////////////////////////////////////////////////////////////////
    /////                                Add Comment                                     /////
    //////////////////////////////////////////////////////////////////////////////////////////
    async addComment(req, res) {
        try {
            const { task_id, comment } = req;

            // Create new comment object
            const newComment = new commentSchema({
                taskId: task_id,
                userId: req.user_id,
                text: comment
            });

            await newComment.validate();
            const savedComment = await newComment.save();

            // Convert to plain object if needed
            const commentObj = savedComment.toObject ? savedComment.toObject() : savedComment;

            return await common.sendResponse(res, Codes.SUCCESS, lang[req.language]['rest_keywords_comment_created_success'], commentObj);
        } catch (error) {
            return await common.sendResponse(res, Codes.INTERNAL_ERROR, lang[req.language]['rest_keyword_something_went_wrong'], null);
        }
    },

    //////////////////////////////////////////////////////////////////////////////////////////
    /////                              Get Comment By Task                               /////
    //////////////////////////////////////////////////////////////////////////////////////////    
    async getCommentsByTask(req, res) {
        try {
            const comments = await commentSchema.find({ taskId: req.task_id })
                .populate("userId", "name email")
                .sort({ createdAt: 1 });

            return await common.sendResponse(res, Codes.SUCCESS, lang[req.language]['rest_keywords_comment_list_success'], comments);

        } catch (error) {
            return await common.sendResponse(res, Codes.INTERNAL_ERROR, lang[req.language]['rest_keyword_something_went_wrong'], null);
        }
    }
}

module.exports = comment_model;