const common = require('../../../config/common');
const notification_model = require('../models/notification_model');
const Codes = require('../../../config/status_codes');
const checkValidationRules = require('../validation');

const createNotification = async (req, res) => {
    // const request = await common.decryption(req);

    req.body.language = req.language;
    req.body.user_id = req.user_id;
    const valid = await common.checkValidationRules(req.body, checkValidationRules.createNotificationValidation);

    if (valid.status) {
        return notification_model.createNotification(req.body, res);
    } else {
        return common.sendResponse(res, Codes.VALIDATION_ERROR, valid.error, null);
    }
};

const getNotificationsByUser = async (req, res) => {
    // const request = await common.decryption(req);

    req.body.language = req.language;
    req.body.user_id = req.user_id;
    const valid = await common.checkValidationRules(req.body, checkValidationRules.getNotificationsByUserValidation);

    if (valid.status) {
        return notification_model.getNotificationsByUser(req.body, res);
    } else {
        return common.sendResponse(res, Codes.VALIDATION_ERROR, valid.error, null);
    }
};

const markAsRead = async (req, res) => {
    // const request = await common.decryption(req);
    
    req.body.language = req.language;
    req.body.user_id = req.user_id;
    req.body.notification_id = req.params.id;
    const valid = await common.checkValidationRules(req.body, checkValidationRules.markAsReadValidation);

    if (valid.status) {
        return notification_model.markAsRead(req.body, res);
    } else {
        return common.sendResponse(res, Codes.VALIDATION_ERROR, valid.error, null);
    }
};

const deleteNotification = async (req, res) => {
    // const request = await common.decryption(req);

    req.body.language = req.language;
    req.body.user_id = req.user_id;
    req.body.notification_id = req.params.id;
    const valid = await common.checkValidationRules(req.body, checkValidationRules.deleteNotificationValidation);

    if (valid.status) {
        return notification_model.deleteNotification(req.body, res);
    } else {
        return common.sendResponse(res, Codes.VALIDATION_ERROR, valid.error, null);
    }
};

module.exports = {
    createNotification,
    getNotificationsByUser,
    markAsRead,
    deleteNotification
}