/* 
* Title: Notification
* Description: Notify the user
* Author: Md Tazri
* Date: 19/9/2021
*
*/

// dependencies
const https = require("https");
const queryString = require("querystring");
const { twilio } = require("./enviroment");

// notification object - module scaffolding
const notification = {};

// send sms to use twilio api
notification.sendTwilioSms = (phone,msg,callback)=>{
    // inpput validation
    const userPhone = typeof(phone) === "string" && phone.length === 11 ? phone : false;
    
    const userMessage = typeof(msg) === "string" && msg.length > 0 && msg.length <= 1500 
    ? msg : false;

    // if userPhone or userMessage any one is in valid
    if(!userPhone || !userMessage){
        callback("Invalid phone or msg. Please input valid msg and phone");
        return;
    }
    // if phone and userMessage is valid then configure the request payload
    const payload = {
        From : twilio.fromPhone,
        To : `+88${userPhone}`,
        Body : userMessage
    }

    // strigify the playload
    const stringPayload = queryString.stringify(payload);

    // configure the request details
    const requestDetails = {
        hostname : "api.twilio.com",
        method : "POST",
        path : `/2010-04-01/Accounts/${twilio.accountSid}/Messages.json`,
        auth : `${twilio.accountSid}:${twilio.authToken}`,
        headers : {
            'Content-Type' : 'applications/x-www-form-urlencoded'
        }
    }

    // instantiate the request object
    const req = https.request(requestDetails,(res)=>{
        // get the status code
        const status = res.statusCode;

        // if successfully send the requset
        if(status === 200 || status === 201 || status === 400){
            callback(true);
        }else{
            callback(`Status Code return was ${status}`);
        }
    });

    // if error
    req.on('error',(e)=>{
        callback(e);
    });

    // send the request`
    req.write(stringPayload);
    req.end();
}

// export notification
module.exports = notification;