const common = require('../../../config/common');
const task_model = require('../models/task_model');
const Codes = require('../../../config/status_codes');
const checkValidationRules = require('../validation');

const createTask = async (req, res) => {
    // const request = await common.decryption(req);

    req.body.language = req.language;
    req.body.user_id = req.user_id;
    const valid = await common.checkValidationRules(req.body, checkValidationRules.createTaskValidation);

    if (valid.status) {
        return task_model.createTask(req.body, res);
    } else {
        return common.sendResponse(res, Codes.VALIDATION_ERROR, valid.error, null);
    }
};

const getTasks = async (req, res) => {
    // const request = await common.decryption(req);

    req.body.language = req.language;
    const valid = await common.checkValidationRules(req.body, checkValidationRules.getTasksValidation);

    if (valid.status) {
        return task_model.getTasks(req.body, res);
    } else {
        return common.sendResponse(res, Codes.VALIDATION_ERROR, valid.error, null);
    }
};

const getTaskById = async (req, res) => {
    // const request = await common.decryption(req);

    req.body.language = req.language;
    req.body.user_id = req.user_id;
    req.body.task_id = req.params.id;
    const valid = await common.checkValidationRules(req.body, checkValidationRules.getTaskByIdValidation);

    if (valid.status) {
        return task_model.getTaskById(req.body, res);
    } else {
        return common.sendResponse(res, Codes.VALIDATION_ERROR, valid.error, null);
    }
};

const updateTask = async (req, res) => {
    // const request = await common.decryption(req);

    req.body.language = req.language;
    req.body.user_id = req.user_id;
    req.body.task_id = req.params.id;
    const valid = await common.checkValidationRules(req.body, checkValidationRules.updateTaskValidation);

    if (valid.status) {
        return task_model.updateTask(req.body, res);
    } else {
        return common.sendResponse(res, Codes.VALIDATION_ERROR, valid.error, null);
    }
};

const markAsCompleted = async (req, res) => {
    // const request = await common.decryption(req);

    req.body.language = req.language;
    req.body.user_id = req.user_id;
    req.body.task_id = req.params.id;
    const valid = await common.checkValidationRules(req.body, checkValidationRules.markAsCompletedValidation);

    if (valid.status) {
        return task_model.markAsCompleted(req.body, res);
    } else {
        return common.sendResponse(res, Codes.VALIDATION_ERROR, valid.error, null);
    }
};

const deleteTask = async (req, res) => {
    // const request = await common.decryption(req);

    req.body.language = req.language;
    req.body.user_id = req.user_id;
    req.body.task_id = req.params.id;
    const valid = await common.checkValidationRules(req.body, checkValidationRules.deleteTaskValidation);

    if (valid.status) {
        return task_model.deleteTask(req.body, res);
    } else {
        return common.sendResponse(res, Codes.VALIDATION_ERROR, valid.error, null);
    }
};

module.exports = {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    markAsCompleted,
    deleteTask
}