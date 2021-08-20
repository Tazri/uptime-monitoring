/* 
* Title: Worker 
* Description: Worker for check the all checks in background
* Author: Md Tazri
* Date: 20/8/201
*
*/

// dependencies
const urlParser = require("url");
const http = require("http");
const https = require("https");
const data = require("./../libs/data");
const { parseJSON } = require("./../libs/utilitiesFunction");
const { sendTwilioSms } = require("./../helpers/notification");

// worker object - module scaffolding
const worker = {};

// alertUserAboutCheckChange
worker.alertUserAboutCheckChange = (checkObject)=>{
    // extract checkObject
    let {
        method,
        protocol,
        state,
        url
    } = checkObject;

    // create msg
    const msg = `Alert: Your check for ${method} ${protocol}://${url} is currently ${state}.`;

    // send the sms
    sendTwilioSms(checkObject.userPhone,msg,(status)=>{
        // if status is true
        if(status === true){
            console.log(`User was alerted to a state change via SMS: ${msg}`);
        }else{
            console.log("Error: There was a problem sending sms to one of the user!");
        }
    })
}

// processCheckOutCome
worker.processCheckOutCome = (checkObject,outcome)=>{
    // extract outcome
    const {
        error,
        responseCode,
    } = outcome;

    // extract checkObject
    const {
        successCodes,
        lastChecked
    } = checkObject;

    // check if check outcome is up or down
    const state = !error && responseCode && successCodes.indexOf(responseCode) > -1 ? 'up' : 'down';
    
    // decide whether we should alert the user or not
    const alertWanted = !!(lastChecked && checkObject.state !== state);

    // update the check data
    checkObject.state = state;
    checkObject.lastChecked = Date.now();

    // update check to disk
    data.update("checks",checkObject.id,checkObject,(status)=>{
        // if status === true
        if(status === true){
            // send the check data to next process
            if(alertWanted){
                worker.alertUserAboutCheckChange(checkObject);
            }else{
                console.log("Alert is no needed as there is no state change");
            }
        }else{
            // if status not equal true
            console.log("Error : trying to save check data of one of the checks!");
        }
    })
}

// performCheck
worker.performCheck = (checkObject)=>{
    // prepare to intial outcome
    let outcome = {
        error : false,
        responseCode : false
    }

    // mark to send outome
    let isSendOutCome = false;

    // extract the checkObject
    let {
        protocol,
        url,
        method,
        timeoutSeconds
    } = checkObject;

    // parse the host name and full url from checkObject
    const parsedUrl = urlParser.parse(`${protocol}://${url}`,true);
    const hostName = parsedUrl.hostname;
    const { path } = parsedUrl;

    // construct the request
    const requestDetails = {
        protocol : `${protocol}:`,
        hostname : hostName,
        method : method.toUpperCase(),
        path,
        timeout : timeoutSeconds * 1000
    };

    // get protocol
    const protocolToUse = protocol === "http" ? http : https;

    // ready to request
    let req = protocolToUse.request(requestDetails,(res)=>{
        // grab the statusCode from response
        let status = res.statusCode;

        // update outcome
        outcome.responseCode = status;

        // if mark is false pass the next process
        if(!isSendOutCome){ 
            worker.processCheckOutCome(checkObject,outcome);
            isSendOutCome = true;
        }

    });

    // if error
    req.on("error",(error)=>{
        // update outcome
        outcome = {
            error : true,
            value : error
        }

        // if mark false update pass the next process
        if(!isSendOutCome){
            worker.processCheckOutCome(checkObject,outcome);
            isSendOutCome = true;
        }
    });

    // if timeout
    req.on("timeout",()=>{
        // update outcome
        outcome = {
            error : true,
            value : "timeout"
        }

        // if mark false pass the next process
        if(!isSendOutCome){
            worker.processCheckOutCome(checkObject,outcome);
            isSendOutCome = true;
        }
    });

    // send the request
    req.end();
}

// validateCheckData
worker.validateCheckData = (checkObject)=>{
    // if checkObject and checkObject.id exist
    if(checkObject && checkObject.id){
        // get state and lastChecked
        let state = checkObject.state;
        let lastChecked = checkObject.lastChecked;

        // validate state and lastChecked
        state = typeof(state) === "string" && ["up","down"].indexOf(state) > -1 ? state : "down";
        lastChecked = typeof(lastChecked) === "number" && lastChecked > 0 ? lastChecked : false;

        // update checkObject
        checkObject.state = state;
        checkObject.lastChecked = lastChecked;

        // pass to next process
        worker.performCheck(checkObject);
    }else{
        // print error
        console.log("Error: check is invalid or not format properly!");
    }
}

// lookup the checks
worker.gatherAllChecks = ()=>{
    // get all checks
    data.readDir("checks",(status,filenames)=>{
        // if not error
        if(status === true && filenames && filenames.length > 0){
            // check every check
            filenames.forEach(check=>{
                // read the checkData 
                data.read("checks",check,(readError,stringData)=>{
                    // if readError exist
                    if(readError){
                        console.log("Error: Can not read one of the data.");
                    }

                    // if don't have any error
                    worker.validateCheckData(parseJSON(stringData));
                });
            });
        }else{
            console.log("Error: Could not find any checks to process!");
        }
    });  
}

// timer for the woker process once per minute
worker.loop = ()=>{
    setInterval(()=>{
        worker.gatherAllChecks();
    },9000);
}

// worker init function
worker.init = ()=>{
    console.log("worker start the work");
    // gatherAllChecks
    worker.gatherAllChecks();

    // call the loop
    worker.loop();
}

// export the worker
module.exports = worker;