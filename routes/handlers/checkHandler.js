/* 
* Title: Check Handler
* Description: This Handler for handle to user check
* Author: Md Tazri
* Date: 17/9/2021
*
*/


// dependencies
const dataLib = require("./../../libs/data");
const {verify} = require("./tokenHandler")._token;
const utilities = require("./../../libs/utilitiesFunction");
const enviroment = require("./../../helpers/enviroment");

// handler object - module scaffolding
const handler = {};


handler.checkHandler = (requestObject,callback) =>{
    // extract requestObject
    let { method } = requestObject;

    // acceptedMethod
    const acceptedMethod = ['get','post','put','delete'];

    // if method is accepted
    if(acceptedMethod.indexOf(method) > -1){
        // call user method
        handler._check[method](requestObject,callback);
    }else{
        callback(405,{
            message : 'This method not allowed'
        });
    }
}

// create check moduler 
handler._check = {};

// post 
handler._check.post = (requestObject,callback)=>{
    // extract body from request objecty
    let body = requestObject.body;

    // isValidcheckObject
    let isValidCheck = utilities.isValidCheckObject(body);

    // if is not valid check object
    if(!isValidCheck.isValid){
        callback(400,{error : "You have a problem in your request."});
        return;
    }

    // if isValid check object
    let checkObject = isValidCheck.body;

    // get the token and check isValid ?
    let {token} = requestObject.headerObject;
    let isValidToken = typeof(token) === 'string' && token.length === 22;

    // if is not valid token
    if(!isValidToken){
        callback(403,{error : "token is not valid."});
        return;
    }

    // if everything is ok
    // read the token
    dataLib.read('tokens',token,(readError,stringReadData)=>{
        // if error is exist
        if(readError){
            callback(403,{error : "authentication problem!"});
            return;
        }

        // if readError dose not exist
        let readData = utilities.parseJSON(stringReadData);
        let userPhone = readData.phone;
        
        // lookup the user
        dataLib.read("users",userPhone,(userReadError,userStringData)=>{
            // if userReadError exist
            if(userReadError){
                callback(404,{error : "user can not found"});
                return;
            }

            // if userReadError dose not exist
            verify(token,userPhone,(tokenStatus)=>{
                // if token status is not valid
                if(tokenStatus !== true){
                    callback(403,{error : "authentication problem!"});
                    return;
                }

                // if token status valid
                let userObject = utilities.parseJSON(userStringData);
                let userChecks = utilities.returnArray(userObject.checks);
                let maxChecks = enviroment.maxChecks;

                // if user reached limits
                if(userChecks.length >= maxChecks){
                    callback(401,{error : "user has already reached max check limit!"});
                    return;
                }

                // if user can not reach limits
                let checkId = utilities.randomToken(20);

                // update check object with checkId and phone number
                checkObject.id = checkId;
                checkObject.userPhone = userPhone;

                // create checks
                dataLib.create("checks",checkId,checkObject,(checkCreateStatus)=>{
                    // if can not create checks
                    if(checkCreateStatus !== true){
                        callback(500,{error : "There was a problem in server side."});
                        return;
                    }

                    // if successfully create checks addCheck id to the user's object
                    userObject.checks = userChecks;
                    userObject.checks.push(checkId);

                    // update user
                    dataLib.update("users",userPhone,userObject,(updateStatus)=>{
                        // if dose not update
                        if(updateStatus !== true){
                            callback(500,{error : "there was a problem in server side."});
                            return;
                        }

                        // if update successfully return the data about new check
                        callback(200,checkObject);
                        return;
                    })

                });
            });

        });
    })
}


// get 
handler._check.get = (requestObject,callback)=>{
    // get checkId from queryString and check isValid
    let {checkid} = requestObject.queryStringObject;
    checkid = typeof(checkid) === "string" && checkid.length === 20 ? checkid : false;

    // if checkId is not valid
    if(!checkid){
        callback(400,{error: "Your have a problem in your request."});
        return;
    }

    // if check id is valid get token and check is valid
    let {token} = requestObject.headerObject;
    token = typeof(token) === "string" && token.length === 22 ? token : false;

    // if token is not valid
    if(!token){
        callback(400,{error: "authenticatin problem.token is not valid."});
        return;
    }

    // if token and check id both are valid
    dataLib.read("checks",checkid,(checkReadError,checkStringData)=>{
        // if checkReadError exist
        if(checkReadError){
            callback(500,{error : "Something is problem in server or check can not found"});
            return;
        }

        // get checkObject
        let checkObject = utilities.parseJSON(checkStringData);

        // else verify the token
        verify(token,checkObject.userPhone,(tokenStatus)=>{
            // if token status not valid
            if(tokenStatus !== true){
                callback(403,{error : "authentication problem."});
                return;
            }

            // if tokenStatus true send the checkObject
            callback(200,checkObject);
            return;
        });
    })
}


// put
handler._check.put = (requestObject,callback)=>{
    // get id and check is ok
    let id = requestObject.body.id;
    
    id = typeof(id) === "string" && id.length === 20 ? id : false;

    // if id not valid
    if(!id){
        callback(400,{error : "Your have a problem in your request.id not correct"});
        return;
    }

    // isValidcheckObject
    let isValidCheckPutData = utilities.isValidPutCheckObject(requestObject.body);

    // if check is not valid check put data
    if(!isValidCheckPutData.isValid){
        callback(400,{error : "You have a problem your request.atleast provide one field."});
        return;
    }

    // if is valid check put data then check token
    let {token} = requestObject.headerObject;
    token = typeof(token) === "string" && token.length === 22 ? token : false;

    if(!token){
        callback(403,{error : "authentication problem!token is not valid."});
        return;
    }

    // if token and data all ok
    dataLib.read("checks",id,(checkReadError,checkStringData)=>{
        // if checkReadError exist
        if(checkReadError){
            callback(500,{error: "something is problem in server side or check not found."});
            return;
        }

        // get checkData and upate with putCheckData
        let checkObject = utilities.parseJSON(checkStringData);
        let userPhone = checkObject.userPhone;

        // verify user
        verify(token,userPhone,(tokenStatus)=>{
            // if token status is not true
            if(tokenStatus !== true){
                callback(403,{error : "authentication problem!"});
                return;
            }

            // if tokenStatus is ok then update data
            let updatedData = utilities.updatePutCheckData(checkObject,isValidCheckPutData.body);

            dataLib.update("checks",id,updatedData,(updateStatus)=>{
                // if updateError is not true
                if(updateStatus !== true){
                    callback(500,{error : "something problem in server side"});
                    return;
                }

                // send updated data
                callback(200,updatedData);
                return;
            })
        })
        
    })
}


// delete2
handler._check.delete = (requestObject,callback)=>{
    // get checkId from queryString and check isValid
    let {checkid} = requestObject.queryStringObject;
    checkid = typeof(checkid) === "string" && checkid.length === 20 ? checkid : false;

    // if checkId is not valid
    if(!checkid){
        callback(400,{error: "Your have a problem in your request."});
        return;
    }

    // if check id is valid get token and check is valid
    let {token} = requestObject.headerObject;
    token = typeof(token) === "string" && token.length === 22 ? token : false;

    // if token is not valid
    if(!token){
        callback(400,{error: "authenticatin problem.token is not valid."});
        return;
    }

    // if token and check id both are valid
    dataLib.read("checks",checkid,(checkReadError,checkStringData)=>{
        // if checkReadError exist
        if(checkReadError){
            callback(500,{error : "Something is problem in server or check can not found"});
            return;
        }

        // get checkObject
        let checkObject = utilities.parseJSON(checkStringData);

        // else verify the token
        verify(token,checkObject.userPhone,(tokenStatus)=>{
            // if token status not valid
            if(tokenStatus !== true){
                callback(403,{error : "authentication problem."});
                return;
            }

            // delete the check by checkid
            dataLib.delete("checks",checkid,(deleteStatus)=>{
                // if can not delete the check
                if(deleteStatus !== true){
                    callback(500,{error : "something is problem in server side!"});
                    return;
                }

                // if successfully delete
                // then remove check from user
                dataLib.read("users",checkObject.userPhone,(userReadError,userStringData)=>{
                    // if user read error exist
                    if(userReadError){
                        callback(500,{error : "user not found in server side problem."});
                        return;
                    }

                    // if successfully read user
                    let userData = utilities.parseJSON(userStringData);
                    let userCheck = utilities.returnArray(userData.checks);
                    let checkIndex = userCheck.indexOf(checkid);

                    // if checkIndex > -1 
                    if(checkIndex > -1){
                        userCheck.splice(checkIndex,1);
                        userData.checks = userCheck;
                    }

                    // then update the user 
                    dataLib.update("users",checkObject.userPhone,userData,(updateStatus)=>{
                        // if can not update
                        if(updateStatus !== true){
                            callback(500,{error: "something problem in server side."});
                            return;
                        }

                        // if update successfully.
                        callback(200,{message : "successfully deleted the check."});
                    });
                });
            });
        });
    })
}

// export
module.exports = handler