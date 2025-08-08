const common = require("../../../config/common");
const lang = require("../../../config/language");
const Codes = require("../../../config/status_codes");
const jwt = require("jsonwebtoken");
const userSchema = require("../../schema/user_schema");

const user_model = {
    /*----------------------------------Check unique email----------------------------------*/
    async checkUniqueEmail(req) {
        try {
            const userDetails = await userSchema.findOne({ email: req.email });
            if (userDetails) {
                return !!userDetails;
            }
        } catch (error) {
            return error;
        }
    },

    //////////////////////////////////////////////////////////////////////////////////////////
    /////                                  Register                                      /////
    //////////////////////////////////////////////////////////////////////////////////////////
    async register(req, res) {
        try {
            // Check if the email is unique  
            const isEmailUnique = await user_model.checkUniqueEmail(req);
            if (isEmailUnique) {
                return await common.sendResponse(res, Codes.NOT_FOUND, lang[req.language]['rest_keywords_unique_email_error'], null);
            }

            // Handle password
            req.password = await common.encryptPlain(req.password);

            const newUser = new userSchema(req);
            await newUser.validate();
            const response = await newUser.save();

            // Convert to plain object and remove password
            let userObj = response.toObject();
            delete userObj.password;

            return await common.sendResponse(res, Codes.SUCCESS, lang[req.language]['rest_keywords_user_signup_success'], userObj);

        } catch (error) {
            return await common.sendResponse(res, Codes.INTERNAL_ERROR, lang[req.language]['rest_keywords_user_signup_failed'], null);
        }
    },

    //////////////////////////////////////////////////////////////////////////////////////////
    /////                                    Login                                       /////
    //////////////////////////////////////////////////////////////////////////////////////////    
    async login(req, res) {
        try {
            const { email, password } = req;

            const user = await userSchema.findOne({ email });
            if (!user) return await common.sendResponse(res, Codes.NOT_FOUND, lang[req.language]['rest_keywords_invalid_email'], null);

            const decryptPassword = await common.decryptPlain(user.password);

            if (decryptPassword !== password) {
                return await common.sendResponse(res, Codes.NOT_FOUND, lang[req.language]['rest_keywords_incorrect_password'], null);
            }

            const token = jwt.sign({ user_id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

            // Convert user to plain object and remove password
            let userObj = user.toObject();
            delete userObj.password;

            // Add token to response
            userObj.token = token;

            return await common.sendResponse(res, Codes.SUCCESS, lang[req.language]['rest_keywords_user_login_succ'], userObj);

        } catch (error) {
            return await common.sendResponse(res, Codes.INTERNAL_ERROR, lang[req.language]['rest_keyword_something_went_wrong'], null);
        }
    },

    //////////////////////////////////////////////////////////////////////////////////////////
    /////                               Get User Details                                 /////
    //////////////////////////////////////////////////////////////////////////////////////////    
    async getUserDetails(req, res) {
        try {
            const user = await userSchema.findById(req.user_id);

            if (user) {
                let userObj = user.toObject();
                delete userObj.password;

                return await common.sendResponse(res, Codes.SUCCESS, lang[req.language]['rest_keywords_user_details_succ'], userObj);
            } else {
                return await common.sendResponse(res, Codes.NOT_FOUND, lang[req.language]['rest_keywords_user_not_found'], null);
            }
        } catch (error) {
            return await common.sendResponse(res, Codes.INTERNAL_ERROR, lang[req.language]['rest_keyword_something_went_wrong'], null);
        }
    },

    //////////////////////////////////////////////////////////////////////////////////////////
    /////                               Get All Users                                    /////
    //////////////////////////////////////////////////////////////////////////////////////////    
    async getUsers(req, res) {
        try {
            const users = await userSchema.find({  }, '_id name');

            if (users.length > 0) {
                const userList = users.map(user => {
                    let userObj = user.toObject();
                    delete userObj.password;
                    return userObj;
                });

                return await common.sendResponse(res, Codes.SUCCESS, lang[req.language]['rest_keywords_users_list_succ'], userList);
            } else {
                return await common.sendResponse(res, Codes.NOT_FOUND, lang[req.language]['rest_keywords_no_users_found'], null);
            }
        } catch (error) {
            return await common.sendResponse(res, Codes.INTERNAL_ERROR, lang[req.language]['rest_keyword_something_went_wrong'], null);
        }
    }
}

module.exports = user_model;