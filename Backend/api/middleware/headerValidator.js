const conn = require("../config/database");
const common = require("../config/common");
const lang = require("../config/language");
const Codes = require("../config/status_codes");
const jwt = require("jsonwebtoken");

const CryptLib = require("cryptlib");
// const userDeviceSchema = require("../modules/schema/tbl_userDeviceInfo");
const shakey = CryptLib.getHashSha256(process.env.KEY, 32);

const headerValidator = {
  //Function for extract accept language from request header and set in req globaly
  extractHeaderLanguage: async (req, res, next) => {
    try {
      const acceptLang = req.headers['accept-language'];

      // Default to "en" if not provided
      const language = (acceptLang && typeof acceptLang === 'string')
        ? acceptLang.split(',')[0].split('-')[0].trim()
        : 'en';

      req.language = language;
      next();
    } catch (error) {
      console.log('Error in extractHeaderLanguage:', error);
      next(); // Don't block the request
    }
  },


  //Function to validate API key of header (Note : Header keys are encrypted)
  validateHeaderApiKey: async (req, res, next) => {
    const bypassHeaderKey = [];

    try {
      // Optional chaining for checking header existence
      const apiKey = req.headers['api-key'] ? req.headers["api-key"] : "";
      // const apiKey = req.headers['api-key'] ? await common.decryptPlain(req.headers["api-key"]) : "";

      const pathData = req.path.split("/");
      if (!bypassHeaderKey.includes(pathData[2])) {
        if (apiKey) {
          if (apiKey === process.env.API_KEY) {
            return next();  // Use return here for consistency
          } else {
            return await common.sendResponse(res, Codes.UNAUTHORIZED, lang[req.language]["rest_keywords_invalid_api_key"], null);
          }
        } else {
          return await common.sendResponse(res, Codes.UNAUTHORIZED, lang[req.language]["rest_keywords_invalid_api_key"], null);
        }
      } else {
        return next(); // Continue without API key validation
      }
    } catch (error) {
      // logger.error(error);
      return await common.sendResponse(res, Codes.INTERNAL_ERROR, "An error occurred", null);
    }
  },

  //Function to validate the token of any user before every request
  // validateHeaderToken: async (req, res, next) => {
  //   const bypassMethod = ["register", "login"];
  //   try {
  //     const headerToken = req.headers["token"] || "";

  //     const pathData = req.path.split("/");

  //     if (!bypassMethod.includes(pathData[2])) {
  //       if (headerToken) {
  //         try {
  //           // Assuming `CryptLib` is properly imported or defined
  //           // const headtoken = CryptLib.decrypt(headerToken, shakey, process.env.IV);

  //           if (headerToken) {
  //             const userData = await userDeviceSchema.findOne({ token: headerToken });

  //             if (userData) {
  //               req.user_id = userData.user_id;
  //               return next();
  //             } else {
  //               return common.sendResponse(res, Codes.UNAUTHORIZED, lang[req.language]["rest_keywords_tokeninvalid"], null);
  //             }
  //           } else {
  //             return common.sendResponse(res, Codes.UNAUTHORIZED, lang[req.language]["rest_keywords_tokeninvalid"], null);
  //           }
  //         } catch (error) {
  //           console.error("Decryption Error: ", error);
  //           return common.sendResponse(res, Codes.UNAUTHORIZED, lang[req.language]["rest_keywords_tokeninvalid"], null);
  //         }
  //       } else {
  //         return common.sendResponse(res, Codes.UNAUTHORIZED, lang[req.language]["rest_keywords_tokeninvalid"], null);
  //       }
  //     } else {
  //       return next();
  //     }
  //   } catch (error) {
  //     console.error("Validation Error in header token: ", error);
  //     return common.sendResponse(res, Codes.INTERNAL_ERROR, "An error occurred", null);
  //   }
  // },

  validateHeaderToken: async (req, res, next) => {
    const bypassMethod = ["register", "login"];
    try {
      const pathData = req.path.split("/");
      if (!bypassMethod.includes(pathData[2])) {

        const token = req.headers["authorization"] ? req.headers["authorization"].split(" ")[1] : "";
        
        if (token) {
          try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user_id = decoded.user_id;
            return next();
          } catch (error) {
            return common.sendResponse(res, Codes.UNAUTHORIZED, lang[req.language]["rest_keywords_tokeninvalid"], null);
          }
        } else {
          return common.sendResponse(res, Codes.UNAUTHORIZED, lang[req.language]["rest_keywords_tokeninvalid"], null);
        }
      } else {
        return next();
      }
    } catch (error) {
      return common.sendResponse(res, Codes.INTERNAL_ERROR, lang[req.language]["rest_keyword_something_went_wrong"], null);
    }
  },
};

module.exports = headerValidator;