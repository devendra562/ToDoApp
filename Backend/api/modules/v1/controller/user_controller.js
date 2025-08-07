const common = require('../../../config/common');
const user_model = require('../models/user_model');
const Codes = require('../../../config/status_codes');
const checkValidationRules = require('../validation');

const register = async (req, res) => {
    // const request = await common.decryption(req);

    req.body.language = req.language;
    const valid = await common.checkValidationRules(req.body, checkValidationRules.registerValidation);

    if (valid.status) {
        return user_model.register(req.body, res);
    } else {
        return common.sendResponse(res, Codes.VALIDATION_ERROR, valid.error, null);
    }
};

const login = async (req, res) => {
    // const request = await common.decryption(req);

    req.body.language = req.language;
    const valid = await common.checkValidationRules(req.body, checkValidationRules.loginValidation);

    if (valid.status) {
        return user_model.login(req.body, res);
    } else {
        return common.sendResponse(res, Codes.VALIDATION_ERROR, valid.error, null);
    }
};

const getUserDetails = async (req, res) => {
    // const request = await common.decryption(req);

    req.body.language = req.language;
    req.body.user_id = req.user_id;

    const valid = await common.checkValidationRules(req.body, checkValidationRules.getUserDetailsValidation);

    if (valid.status) {
        return user_model.getUserDetails(req.body, res);
    } else {
        return common.sendResponse(res, Codes.VALIDATION_ERROR, valid.error, null);
    }
};

const getUsers = async (req, res) => {
    // const request = await common.decryption(req);

    req.body.language = req.language;
    req.body.user_id = req.user_id;

    const valid = await common.checkValidationRules(req.body, checkValidationRules.getUsersValidation);

    if (valid.status) {
        return user_model.getUsers(req.body, res);
    } else {
        return common.sendResponse(res, Codes.VALIDATION_ERROR, valid.error, null);
    }
};

module.exports = {
    register,
    login,
    getUserDetails,
    getUsers
}