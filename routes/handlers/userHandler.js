/* 
* Title: User Handler
* Description: Handler to user releated routes
* Author: Md Tazri
* Date: 10/8/2021
*
*/

const dataLib = require("../../libs/data");
const utilities = require("../../libs/utilitiesFunction");

// handler object - module scaffolding
const handler = {};


handler.userHandler = (requestObject,callback) =>{
    // extract requestObject
    let { method } = requestObject;

    // acceptedMethod
    const acceptedMethod = ['get','post','put','delete'];

    // if method is accepted
    if(acceptedMethod.indexOf(method) > -1){
        // call user method
        handler._user[method](requestObject,callback);
    }else{
        callback(405,{
            message : 'This method not allowed'
        });
    }
}

// create _user property for store all user releated method
handler._user = {};

// post
handler._user.post = (requestObject,callback)=>{
    // getUserData
    let userData = requestObject.body;
    let postData = utilities.isValidPostUserData(userData);

    // if postData is Valid
    if(postData.isValid){
        // get user phone number for id
        const phone  = postData.body.phone;

        // check the user alread exist or not
        dataLib.read("users",phone,(readError)=>{
            if(readError){
                // create user
                dataLib.create('users',phone,postData.body,(status)=>{
                    // if create error dose not exist
                    if(status === true){
                        // send the message
                        callback(200,{message : "User create succesfully"});
                    }else{
                        // if error is exist
                        callback(500,{error : "User can not create."})
                    }
                })
            }else{
                // if user is already exist
                callback(500,{error : "User is already exist."})
            }
        })
    }else{
        // if postData is not Valid
        callback(400,{
            message : 'There is problem in you request.'
        })
    }
}

// get
handler._user.get = (requestObject,callback)=>{
    // get query from requestObject
    let phone = requestObject.queryStringObject.phone;

    // if not give the phone number
    if(!phone){
        callback(500,{error : "please send the phone number for user id"});
        return ;
    }

    // if give the phone number
    dataLib.read('users',phone,(readError,data)=>{
        // if readError is not exist
        if(!readError){
            // ready the data for send to client
            let userData = utilities.parseJSON(data);
            let getData = {...userData};
            
            // delete the password from the getData
            delete getData.password;
            getData.date = new Date().toLocaleTimeString();
            callback(200,{...getData});
        }else{
            // if readError exist
            callback(404,{error : "User Can not found"})
        }
    })

}

// put
handler._user.put = (requestObject,callback)=>{
    // extract data
    let userGievenData = requestObject.body;
    let phone = userGievenData.phone;

    // if user give the phone number
    if(phone){
        // filter given data
        let filteredData = utilities.fileterForPutData(userGievenData);

        // check is user is exist
        dataLib.read("users",phone,(readError,data)=>{
            // if readError dose not exist
            if(!readError){
                // parse the user data and update the data
                let userData = utilities.parseJSON(data);
                let updatedData = utilities.getUpdatedData(userData,filteredData);

                // update the data
                dataLib.update("users",phone,updatedData,(updateStatus)=>{
                    // if update succesfully
                    if(updateStatus === true){
                        // delete password and add data in updated data and sent 
                        delete updatedData.password;
                        updatedData.date = new Date().toLocaleTimeString('bn-BD');

                        callback(200,updatedData);
                    }else{
                        // if can not update the data
                        callback(500,{error : "something is problem in server."});
                    }
                })
            }else{
                // if readError is exist
                callback(404,{error : "user can not found"})
            }
        })

    }else{
        // if user can not give the phone number
        callback(500,{error : "get not give the phone number."})
    }
}

// delete
handler._user.delete = (requestObject,callback)=>{
    // get phone number
    let phone = requestObject.queryStringObject.phone;

    // checkIsValid phone
    let isValidPhone = utilities.isValidPhoneNumber(phone).isValid;

    // if it valid phone
    if(isValidPhone){
        // delete the user file
        dataLib.delete("users",phone,(deleteStatus)=>{
            // if delete the user successfully
            if(deleteStatus === true){
                callback(200,{message : "User is deleted",date : new Date().toLocaleTimeString("bn-BD")});
            }else{
                // if user can not delete
                callback(500,{error : "user can not delete"})
            }
        });
    }else{
        // if is not valid phone
        callback(404,{error: "This phone number is not valid."});
    }
}

module.exports = handler;