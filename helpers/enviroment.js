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
    envName : 'staging'
}

// production
enviroments.production = {
    secretKey : "This is production enviroment production",
    port : '5000',
    envName : 'production'
}

// select enviroment
const inputEnv = process.env.NODE_ENV;
const selectedEnv = typeof(inputEnv) === 'string' ? inputEnv : 'staging';

const enviromentToExport = typeof(enviroments[selectedEnv]) === 'object' ? enviroments[selectedEnv] : enviroments.staging;

// export enviroment
module.exports = enviromentToExport;