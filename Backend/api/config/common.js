const Validator = require("Validator");
const conn = require("../config/database");
const GLOBALS = require("../config/constant");
const nodemailer = require('nodemailer');

const CryptLib = require("cryptlib");
var shakey = CryptLib.getHashSha256(process.env.KEY, 32);

var common = {
  //function for send Response
  sendResponse: async (res, resCode, msgKey, resData) => {
    try {
      const responsejson = {
        code: resCode,
        message: msgKey,
      };
      if (resData != null) {
        responsejson.data = resData;
      }
      const result = await common.encryption(responsejson);
      // return res.status(resCode).send(JSON.stringify(result));
      return res.status(resCode).send(responsejson);
    } catch (error) {
      console.log(error);
      // logger.error(error);
    }       
  },

  // Decrypt user request
  decryption: async (req) => {
    try {
      if (req.body != undefined && Object.keys(req.body).length !== 0) {
        const request = JSON.parse(CryptLib.decrypt(req.body, shakey, process.env.IV));
        request.language = req.language;
        request.user_id = req.user_id;
        return request;
      } else {
        return {};
      }
    } catch (error) {
      console.log('Error:', error);
      return {};
    }
  },

  // Encrypt user request
  encryption: async (data) => {
    try {
      return CryptLib.encrypt(JSON.stringify(data), shakey, process.env.IV);
    } catch (error) {
      return "";
    }
  },

  // Encrypt plain data
  encryptPlain: function (data) {
    try {
      return CryptLib.encrypt(JSON.stringify(data), shakey, process.env.IV);
    } catch (error) {
      return "";
    }
  },

  // Decrypt plain data
  decryptPlain: function (data) {
    try {
      const decryptedData = CryptLib.decrypt(data, shakey, process.env.IV);
      return JSON.parse(decryptedData);
    } catch (error) {
      console.log("Decryption Error: ", error);
      return null; // Return null or handle the error in a way that suits your application
    }
  },

  //check Validation Rules
  checkValidationRules: async (request, rules) => {
    try {
      const v = Validator.make(request, rules);
      const validator = {
        status: true,
      }
      if (v.fails()) {
        const ValidatorErrors = v.getErrors();
        validator.status = false
        for (const key in ValidatorErrors) {
          validator.error = ValidatorErrors[key][0];
          break;
        }
      }
      return validator;
    } catch (error) {
      console.log(error)
    }
  },

  //check,update,insert user device details
  checkDeviceInfo: async (user_id) => {
    try {
      const [rows, fields] = await conn.query("SELECT * FROM tbl_user_deviceinfo WHERE user_id = '" + user_id + "' ");
      if (rows.length > 0) {
        return rows[0];
      } else {
        return null;
      }
    } catch (error) {
      logger.error(error)
    }
  },

  updateDeviceInfo: async (user_id, params) => {
    try {
      const [rows, fields] = await conn.query("UPDATE tbl_user_deviceinfo SET ? WHERE user_id = '" + user_id + "' ", [params]);
      if (rows.affectedRows != 0) {
        return rows[0];
      } else {
        return null;
      }
    } catch (error) {
      console.log(error);
      // logger.error(error);
    }
  },

  insertDeviceInfo: async (params) => {
    try {
      const [rows, fields] = await conn.query("INSERT INTO  tbl_user_deviceinfo SET ?", [params]);
      if (rows.insertId != 0) {
        return rows.insertId;
      } else {
        return null;
      }
    } catch (error) {
      logger.error(error)
    }
  },

  checkUpdateDeviceInfo: async (user_id, params) => {
    try {
      var randtoken = require('rand-token').generator();
      var token = randtoken.generate(64, "0123456789abcdefghijklnmopqrstuvwxyz");
      var upd_device = {
        // user_type: (user_type != undefined) ? user_type : "user" ,
        // uuid: (req.uuid != undefined) ? req.uuid : "",
        // ip: (req.ip != undefined) ? req.ip : "",
        token: token,
        device_type: (params.device_type != undefined) ? params.device_type : "",
        device_token: (params.device_token != undefined) ? params.device_token : "",
        os_version: (params.os_version != undefined) ? params.os_version : "",
        model_name: (params.model_name != undefined) ? params.model_name : "",
        device_name: (params.device_name != undefined) ? params.device_name : ""
      };

      const checkDeviceInfo = await common.checkDeviceInfo(user_id);
      if (checkDeviceInfo != null) {
        const updateDeviceInfo = await common.updateDeviceInfo(user_id, upd_device);
      } else {
        upd_device.token = '';
        upd_device.user_id = user_id;
        // upd_device.user_type = user_type;
        const insertDeviceInfo = await common.insertDeviceInfo(upd_device);
      }
    } catch (error) {
      // logger.error(error)
      console.log(error);
    }
  },

  //generate OTP
  generateOTP: function () {
    //return 1234;
    return Math.floor(1000 + Math.random() * 9000)
  },

  //generate Token 
  generateToken(length = 5) {
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var text = "";
    for (var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  },

  //single update
  singleUpdate: async (tablename, params, condition) => {
    try {
      const [rows, fields] = await conn.query("UPDATE " + tablename + " SET ? WHERE " + condition + " ", params);
      if (rows.affectedRows != 0) {
        return rows;
      } else {
        return null;
      }
    } catch (error) {
      console.log(error);
      // logger.error(error)
    }
  },

  //single insert
  singleInsert: async (tablename, params) => {
    try {
      const [rows, fields] = await conn.query('INSERT INTO ' + tablename + ' SET ?', params);
      if (rows.insertId != 0) {
        return rows.insertId;
      } else {
        return null;
      }
    } catch (error) {
      logger.error(error)
    }
  },

  //get single record
  getCommonSingleRecord: async (tablename, condition) => {
    try {
      const [rows, fields] = await conn.query("SELECT * from " + tablename + " WHERE " + condition + " ");
      if (rows.length > 0) {
        return rows[0];
      } else {
        return null;
      }
    } catch (error) {
      console.log(error);
      // logger.error(error);
    }
  },

  //get multiple record
  getCommonMultipleRecord: async (tablename, condition) => {
    try {
      const [rows, fields] = await conn.query("SELECT * from " + tablename + " WHERE " + condition + " ");
      if (rows.length > 0) {
        return rows;
      } else {
        return [];
      }
    } catch (error) {
      logger.error(error)
    }
  },

  //update user
  updateUserDetails: async (user_id, params) => {
    try {
      const singleUpdate = await common.singleUpdate('tbl_user', params, `id = ${user_id}`);
      if (singleUpdate.affectedRows != 0) {
        return await common.getUserDetails(user_id);;
      } else {
        return null;
      }
    } catch (error) {
      console.log(error);
      // logger.error(error);
    }
  },

  //insert notification
  insertNotification: async (notification) => {
    try {
      delete notification.message;
      const [rows, fields] = await conn.query("INSERT INTO tbl_notification SET ?", notification);
      if (rows.insertId != 0) {
        return rows.insertId;
      } else {
        return null;
      }
    } catch (error) {
      logger.error(error)
    }
  },

  //update forgot password
  updateForgotPassword: async (email, token) => {
    try {
      const forgot_password = {
        email: email,
        token: token
      }

      const selectQuery = `insert into tbl_pass_reset set ?`
      const [rows, fields] = await conn.query(selectQuery, [forgot_password]);
      if (rows.insertId != 0) {
        return rows.insertId;
      } else {
        return null;
      }
    } catch (error) {
      logger.error(error)
    }
  },

  //function for get user details
  getUserDetails: async (req) => {
    try {
      const [rows, fields] = await conn.query(`
                SELECT u.*, CONCAT('${GLOBALS.S3_BUCKET_ROOT}', u.profile_image) AS profile_image,
                IFNULL(d.token, '') AS token, IFNULL(d.device_type, '') AS device_type, 
                IFNULL(d.device_token, '') AS device_token 
                FROM tbl_user u 
                LEFT JOIN tbl_user_deviceinfo d ON d.user_id = u.id
                WHERE u.id = '${req}' AND u.is_delete = '0'`);

      if (rows.length > 0) {
        return rows[0];
      } else {
        return null;
      }
    } catch (error) {
      console.log("Error in getUserDetails:", error);
      // return await common.sendResponse(res, Codes.INTERNAL_ERROR, lang[req.language]['text_user_something_wrong'], error);
    }
  },

  //node-mailer function
  sendEmail: async (toEmail, subject, message) => {
    try {
      // Set up the transporter object using SMTP transport and authentication
      const transporter = nodemailer.createTransport({
        service: 'gmail', 
        auth: {
          user: process.env.EMAIL_ID,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      // Define the email options
      const mailOptions = {
        from: process.env.EMAIL_ID,
        to: toEmail,
        subject: subject,
        html: message,
      };

      // Send the email and wait for the promise to resolve
      const info = await transporter.sendMail(mailOptions);
      return true;

    } catch (error) {
      console.log(error);
      return false;
    }
  },

  //twilio
  sendSMS: async (mobile_number, message) => {
    try {
      if (mobile_number != '' && mobile_number != undefined) {

        // Initialize Twilio client
        const client = require('twilio')(GLOBALS.TWILLIO_ACCOUNT_SID, GLOBALS.TWILLIO_ACCOUNT_AUTH);

        // Send SMS using Twilio client
        await client.messages.create({
          body: message,
          from: GLOBALS.TWILLIO_ACCOUNT_PHONE,
          to: mobile_number
        });

        return true;
      }
      return false;
    } catch (error) {
      console.log(error);
      return false
    }
  },
};

module.exports = common;