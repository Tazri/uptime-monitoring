/* 
* Title: utilites function
* Description: Here create the function for simple work
* Author: Md Tazri
* Date: 9/8/2021
*
*/

// dependencies
const url = require('url');
const crypto = require('crypto');
const enviromentToExport = require('../helpers/enviroment');

// utilities object - module scaffolding
const utilities = {};

// parseUrl
utilities.parseUrl = (req)=>{
    // extract req
    const parseUrl = url.parse(req.url,true);
    const path = parseUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g,'');
    const method = req.method.toLowerCase();
    const queryStringObject = parseUrl.query;
    const headerObject = req.headers;

    // create own request object
    const requestObject = {
        parseUrl,
        path,
        trimmedPath,
        method,
        queryStringObject,
        headerObject
    }

    return requestObject;
}

// parseJSON
utilities.parseJSON = (stringData)=>{
    let output ;

    // try to parse object
    try{
        output = JSON.parse(stringData);
    }catch(parseError){
        output = {};
    }

    return output;
}

// isValidPostUserData 
utilities.isValidPostUserData = (userData)=>{
    /**
     * data will be like
     * {
     * firstName : 'Md',
     * lastName : 'Tazri',
     * phone : '01234567891',
     * gender : 'male/female',
     * isAgree : true/false,
     * password : **********
     * }
     */

    // get valid data 
    let validData = utilities.compactData(userData);

    // check all 6 data is here ?
    let isValidPostData = Object.keys(validData).length === 6 ? true : false;

    // createPostData
    let postData = {
        isValid : false
    }

    // if is Valid post data
    if(isValidPostData){
        postData.isValid = true;
        postData.body = validData;
    }
    
    // return postData
    return postData;
}

utilities.fileterForPutData = (userData)=>{
    // compact the data
    let compactedData = utilities.compactData(userData);
    // extract the data
    let {
        firstName,
        lastName,
        gender,
        password
    } = compactedData;

    // create put data
    let putData = {};
    
    // store put data
    if(firstName){
        putData.firstName = firstName;
    }

    if(lastName){
        putData.lastName = lastName;
    }

    if(gender){
        putData.gender = gender
    }

    if(password){
        putData.password = password;
    }

    return putData;
}

// remove all unvalid data
utilities.compactData = (userData)=>{
    // extract the userData
    let {
        firstName,
        lastName,
        phone,
        gender,
        isAgree,
        password
    } = userData;
    
    // getAll valid Data
    let compactUser = {}

    // check everything is valid
    let isValidFirstName = typeof(firstName) === "string" && firstName.trim().length >= 3;
    let isValidLastName = typeof(lastName) === "string" && lastName.trim().length >= 3;
    let isValidPhone = utilities.isValidPhoneNumber(phone).isValid;
    let isValidGenderType = utilities.isValidGenderType(gender).isValid;
    let isAgreeValid = utilities.isAgreeValid(isAgree).isValid;
    let isValidPassword = utilities.isValidPassword(password);

    // if firstName is valid
    if(isValidFirstName){
        compactUser.firstName = firstName;
    }

    // if lastName is valid
    if(isValidLastName){
        compactUser.lastName = lastName;
    }

    // if phone number is valid
    if(isValidPhone){
        compactUser.phone = phone;
    }

    // if gender is valid
    if(isValidGenderType){
        compactUser.gender = gender;
    }

    // if user is agree
    if(isAgreeValid){
        compactUser.isAgree = isAgree;
    }

    // if password is valid
    if(isValidPassword.isValid){
        compactUser.password = isValidPassword.password;
    }

    return compactUser;
}

// isValidName 
utilities.isValidName=  (firstName,lastName)=>{
    // check both are string ?
    let nameObject = {
        fullName : '',
        firstName,
        lastName,
        isValid : false,
    };

    // check both are string ??
    if(typeof(firstName) != 'string'  || typeof(lastName) != 'string'){
        return nameObject;
    }

    // check both string are not empty
    if(!firstName.trim() && !lastName.trim()){
        return nameObject;
    }

    // create full name
    nameObject.fullName = firstName.trim() + ' ' + lastName.trim();


    // check full name length greater then 7
    if(nameObject.fullName.length < 7){
        return nameObject
    }

    // return valid nameObject
    nameObject.isValid = true;
    return nameObject;
}

// isValidPhoneNumber
utilities.isValidPhoneNumber = phone=>{
    // number object
    let numberObject = {
        phone,
        isValid : false
    }

    // if is not string
    if(!(typeof(phone) === "string")){
        return numberObject;
    }else{
        // number array
        const numberArray = ['0','1','2','3','4','5','6','7','8','9'];

        // check number length less then 11
        if(phone.length < 11){
            return numberObject
        }

        // check every think is number
        let phoneInString = phone.split('');
        for(n of phoneInString){
            if(numberArray.indexOf(n) < 0){
                return numberObject;
            }
        }

        // return valid numberObject
        numberObject.isValid = true;
        return numberObject
    }
}

// isValidGenderType
utilities.isValidGenderType = gender =>{
    // create genderObject
    let genderObject = {
        gender,
        isValid : false
    }

    // if gender is not string
    if(!(typeof(gender) == "string")){
        return genderObject
    }

    // check is male or female
    if(gender == 'male' || gender == 'female'){
        // return valid genderObject
        genderObject.isValid = true;
        return genderObject;
    }

    return genderObject;
}

// isAgreeValid
utilities.isAgreeValid = (isAgree)=>{
    let isAgreeObject = {
        isAgree,
        isValid : false
    }

    if(isAgree === true){
        isAgreeObject.isValid = true;
    }

    return isAgreeObject;
}

// isValidPassword
utilities.isValidPassword = password =>{
    // passwordObject
    let passwordObject = {
        password,
        isValid : false
    }

    // if is not string
    if(!(typeof(password) === "string")){
        return passwordObject
    }else{
        // if password length is not greater then 6
        if(password.length < 6){
            return passwordObject;
        }

        // return valid passwordObject
        passwordObject.isValid = true;

        // get secret key from enviroment data
        let secretKey = enviromentToExport.secretKey;

        // hash the password 
        let hash = crypto.createHmac("sha256",secretKey)
        .update(password).digest("hex");

        // change password to hash
        passwordObject.password = hash;

        return passwordObject;
    }
}

// getUpdatedData
utilities.getUpdatedData = (userData,updateData)=>{
    // extract updatedData
    let {
        gender,
        firstName,
        lastName,
        password
    } = updateData;

    // create data object which return the end
    let data = {...userData};

    // update information
    if(gender){
        data.gender = gender;
    }

    if(firstName){
        data.firstName = firstName;
    }

    if(lastName){
        data.lastName = lastName;
    }

    if(password){
        data.password = password;
    }

    return data;
}

// randomToken
utilities.randomToken = (tokenLength)=>{
    // check tokenLength is number
    if(typeof(tokenLength) !== "number"){
        return false;
    }

    // create token
    let characters = "0123456789abcdefghkjlmnopqrsptwxyzABCDEFGHKLHGHSKWXYZABO";
    let charLength = characters.length;
    let token = '';

    for(let i = 0; i < tokenLength; i++){
        let randomIndex = Math.floor(Math.random()*charLength);
        token = token + characters.charAt(randomIndex);
    }

    return token;
}

// getToken
utilities.getToken = (length,phone)=>{
    // create token
    let token = utilities.randomToken(length);

    // if token is not valid
    if(!token){
        return false
    }

    let date = new Date();
    let createDate = date.toLocaleDateString()+ " " + date.toLocaleTimeString();
    let expireDate = Date.now() + (60*60*1000);

    return {
        token,
        createDate,
        expireDate,
        phone
    }
}

// isValidCheckObject
utilities.isValidCheckObject = (userObject)=>{
    // extract all data
    let {
        protocol,
        url:userGivenUrl,
        method,
        successCodes,
        timeoutSeconds
    } = userObject;


    // input checkObject like
    /**
     * {
     * protocol : "http"/"https",
     * url : "".length > 0
     * method : "GET"/"POST"/"PUT"/"DELETE",
     * successCodes : 0 <= [].length <= 5,
     * timeoutSecounds : number % 2 === 0 && 0 < number >= 5;
     * }
     * 
     */

    // creaet checkObject
    let checkObject = {
        body : {},
        isValid : false
    }

    // check information
    let isValidProtocol = protocol === "http" || protocol === "https";
    let isValidUrl = typeof(userGivenUrl) === "string" && userGivenUrl.trim().length > 0;
    let isValidMethod = ["POST","GET","PUT","DELETE"].indexOf(method) > -1;
    let isValidSuccessCodes = typeof(successCodes) === "object" && (successCodes instanceof Array);
    let isValidtimeoutSeconds = (typeof(timeoutSeconds) === "number" && timeoutSeconds % 1 === 0) && (timeoutSeconds > 0 && timeoutSeconds <= 5);
    
    
    // if not valid protocol
    if(!isValidProtocol){
        return checkObject;
    }

    // if not valid url
    if(!isValidUrl){
        return checkObject;
    }

    // if not valid mathod
    if(!isValidMethod){
        return checkObject;
    }

    // if not valid successCodes
    if(!isValidSuccessCodes){
        return checkObject;
    }

    // if not valid timeoutSeconds
    if(!isValidtimeoutSeconds){
        return checkObject;
    }

    // if everything ok update checkObject
    checkObject.body = {
        protocol,
        url : userGivenUrl.trim(),
        method,
        successCodes,
        timeoutSeconds
    }
    checkObject.isValid = true;

    return checkObject;
}

// isValidPutCheckObject
utilities.isValidPutCheckObject = (userData)=>{
    // extract all data
    let {
        protocol,
        url:userGivenUrl,
        method,
        successCodes,
        timeoutSeconds
    } = userData;

    // creaet checkObject
    let checkObject = {
        body : {},
        isValid : false
    }

    // check information
    let isValidProtocol = protocol === "http" || protocol === "https";
    let isValidUrl = typeof(userGivenUrl) === "string" && userGivenUrl.trim().length > 0;
    let isValidMethod = ["POST","GET","PUT","DELETE"].indexOf(method) > -1;
    let isValidSuccessCodes = typeof(successCodes) === "object" && (successCodes instanceof Array);
    let isValidtimeoutSeconds = (typeof(timeoutSeconds) === "number" && timeoutSeconds % 1 === 0) && (timeoutSeconds > 0 && timeoutSeconds <= 5);

    // create body
    let body = {};

    // if valid protocol
    if(isValidProtocol){
        body.protocol = protocol;
    }

    // if valid url
    if(isValidUrl){
        body.url = userGivenUrl;
    }

    // if valid mathod
    if(isValidMethod){
        body.method = method;
    }

    // if valid successCodes
    if(isValidSuccessCodes){
        body.successCodes = successCodes;
    }

    // if valid timeoutSeconds
    if(isValidtimeoutSeconds){
        body.timeoutSeconds = timeoutSeconds;
    }

    checkObject.body = body;

    // if body key are greater then 0
    if(Object.keys(body).length > 0){
        checkObject.isValid = true;
    }

    return checkObject;
}

// updatePutCheckData
utilities.updatePutCheckData = (userData,updateData)=>{
    // extract all data from updateData
    let {
        protocol,
        url:userGivenUrl,
        method,
        successCodes,
        timeoutSeconds
    } = updateData;

    // update information1
    if(protocol){
        userData.protocol = protocol;
    }

    if(userGivenUrl){
        userData.url = userGivenUrl;
    }

    if(method){
        userData.method = method;
    }

    if(successCodes){
        userData.successCodes = successCodes;
    }

    if(timeoutSeconds){
        userData.timeoutSeconds = timeoutSeconds
    }

    // return update userData
    return userData;
}

// returnArray
utilities.returnArray = (data)=>{
    // check is data is array ?
    let isArray = typeof(data) === "object" && data instanceof Array;

    if(isArray) return data;
    return [];
}

// export 
module.exports = utilities;