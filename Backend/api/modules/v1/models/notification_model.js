const common = require("../../../config/common");
const lang = require("../../../config/language");
const Codes = require("../../../config/status_codes");
const notificationSchema = require("../../schema/notification_schema");

const notification_model = {
    //////////////////////////////////////////////////////////////////////////////////////////
    /////                               Add Notification                                 /////
    //////////////////////////////////////////////////////////////////////////////////////////
    async createNotification(req, res) {
        try {
            const { title, user_id, message } = req;

            // Create new notification object
            const newNotification = new notificationSchema({
                title,
                user_id,
                message
            });

            await newNotification.validate();
            const savedNotification = await newNotification.save();

            // Convert to plain object if needed
            const notificationObj = savedNotification.toObject ? savedNotification.toObject() : savedNotification;

            return await common.sendResponse(
                res,
                Codes.SUCCESS,
                lang[req.language]['rest_keywords_notification_created_success'],
                notificationObj
            );
        } catch (error) {
            return await common.sendResponse(
                res,
                Codes.INTERNAL_ERROR,
                lang[req.language]['rest_keyword_something_went_wrong'],
                null
            );
        }
    },

    //////////////////////////////////////////////////////////////////////////////////////////
    /////                           Get Notification By User                             /////
    //////////////////////////////////////////////////////////////////////////////////////////    
    async getNotificationsByUser(req, res) {
        try {
            const notifications = await notificationSchema.find({ user_id: req.user_id })
                .sort({ created_at: -1 });

            return await common.sendResponse(res, Codes.SUCCESS, lang[req.language]['rest_keywords_notification_list_success'], notifications);
        } catch (error) {
            return await common.sendResponse(res, Codes.INTERNAL_ERROR, lang[req.language]['rest_keyword_something_went_wrong'], null);
        }
    },

    //////////////////////////////////////////////////////////////////////////////////////////
    /////                               Mark Notification As Read                        /////
    //////////////////////////////////////////////////////////////////////////////////////////
    async markAsRead(req, res) {
        try {
            const { notification_id } = req;
            console.log(`Marking notification as read: ${notification_id}`);
            
            const updated = await notificationSchema.findByIdAndUpdate(notification_id, { is_read: true }, { new: true });

            if (!updated) {
                return await common.sendResponse(res, Codes.NOT_FOUND, lang[req.language]['rest_keywords_notification_not_found'], null);
            }

            return await common.sendResponse(res, Codes.SUCCESS, lang[req.language]['rest_keywords_notification_marked_read_success'], updated);
        } catch (error) {
            return await common.sendResponse(res, Codes.INTERNAL_ERROR, lang[req.language]['rest_keyword_something_went_wrong'], null);
        }
    },

    //////////////////////////////////////////////////////////////////////////////////////////
    /////                               Delete Notification                              /////
    //////////////////////////////////////////////////////////////////////////////////////////
    async deleteNotification(req, res) {
        try {
            const { notification_id } = req;
            const deletedNotification = await notificationSchema.findByIdAndDelete(notification_id);

            if (!deletedNotification) {
                return await common.sendResponse(res, Codes.NOT_FOUND, lang[req.language]['rest_keywords_notification_not_found'], null);
            }

            return await common.sendResponse(res, Codes.SUCCESS, lang[req.language]['rest_keywords_notification_deleted_success'], null);
        } catch (error) {
            return await common.sendResponse(res, Codes.INTERNAL_ERROR, lang[req.language]['rest_keyword_something_went_wrong'], null);
        }
    }

}

module.exports = notification_model;