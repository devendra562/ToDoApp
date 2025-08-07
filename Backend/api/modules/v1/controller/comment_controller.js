const common = require('../../../config/common');
const comment_model = require('../models/comment_model');
const Codes = require('../../../config/status_codes');
const checkValidationRules = require('../validation');

const addComment = async (req, res) => {
    // const request = await common.decryption(req);

    req.body.language = req.language;
    req.body.user_id = req.user_id;
    req.body.task_id = req.params.id;
    const valid = await common.checkValidationRules(req.body, checkValidationRules.addCommentValidation);

    if (valid.status) {
        return comment_model.addComment(req.body, res);
    } else {
        return common.sendResponse(res, Codes.VALIDATION_ERROR, valid.error, null);
    }
};

const getCommentsByTask = async (req, res) => {
    // const request = await common.decryption(req);

    req.body.language = req.language;
    req.body.user_id = req.user_id;
    req.body.task_id = req.params.id;
    const valid = await common.checkValidationRules(req.body, checkValidationRules.getCommentsByTaskValidation);

    if (valid.status) {
        return comment_model.getCommentsByTask(req.body, res);
    } else {
        return common.sendResponse(res, Codes.VALIDATION_ERROR, valid.error, null);
    }
};

module.exports = {
    addComment,
    getCommentsByTask
}