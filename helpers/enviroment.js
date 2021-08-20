/* 
* Title: Enviroment
* Description: Handle enviroment variable
* Author: Md Tazri
* Date: 8/9/2021
*
*/

// enviroments object - module scaffolding
const enviroments = {};

// staging
enviroments.staging = {
    secretKey : "I am a programmer",
    port : '3030',
    envName : 'staging',
    maxChecks : 5,
    twilio : {
        fromPhone : '+15005550006',
        accountSid : "AC1f1424f9bf58b58584588ed0934e634e",
        authToken : "926d4724347aa9de6b5cc7fd07ae9bca"
    }
}

// production
enviroments.production = {
    secretKey : "This is production enviroment production",
    port : '5000',
    envName : 'production',
    maxChecks : 5,
    twilio : {
        fromPhone : '+15005550006',
        accountSid : "AC1f1424f9bf58b58584588ed0934e634e",
        authToken : "926d4724347aa9de6b5cc7fd07ae9bca"
    }
}

// select enviroment
const inputEnv = process.env.NODE_ENV;
const selectedEnv = typeof(inputEnv) === 'string' ? inputEnv : 'staging';

const enviromentToExport = typeof(enviroments[selectedEnv]) === 'object' ? enviroments[selectedEnv] : enviroments.staging;

// export enviroment
module.exports = enviromentToExport;