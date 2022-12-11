const { ObjectId } = require('mongodb');
const emailRegex = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/;
const regex = new RegExp('^[A-Za-z0-9]+$');
const passwordRegex = new RegExp('^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{6,}$')
  
let validateId = (id, tex) => {
  if (!id) throw `${tex} provide valid id`;
  if (typeof id !== 'string') throw `${tex} should be a string`;
  if (id.trim().length === 0) throw `${tex} cannot be empty or space`;
  id = id.trim();
  if (!ObjectId.isValid(id)) throw 'invalid object id';
  return id
}; 


let validateText = (textData, tex) => {
  if (!textData) throw `${tex} provide valid input data`;
  if (typeof textData !== 'string') throw `${tex} data should be a string`;
  if (textData.trim().length === 0) throw `${tex} cannot be empty or space`;
  textData = textData.trim();
  return textData
};


let validateName = (name, nameString) => {
  if (!name) throw `${nameString} should not be empty`;
  if (typeof name !== "string") throw `${nameString} is not a string`;
  name = name.trim();
  if (name === "") throw `${nameString} cannot be blank spaces`;
  if (!name.match(regex)) throw `${nameString} should be alphanumeric value`;
  return name;
};

let validateString = (name, nameString) => {
  if (!name) throw `${nameString} should not be empty`;
  if (typeof name !== "string") throw `${nameString} is not a string`;
  name = name.trim();
  if (name === "") throw `${nameString} cannot be blank spaces`;
  return name;
};


let validateEmail = (email, emailString) => {
  if (!email) throw `${emailString} should not be empty`;
  if (typeof email !== "string") throw `${emailString} is not a string`;
  email = email.trim();
  if (email === "") throw `${emailString} should not be blank spaces`;
  if (!emailRegex.test(email)) throw `${emailString} is not proper format`;
  return email
};

let validatePassword = (password) => {
  if (!password) throw "Password should not be empty";
  if (typeof password !== "string") throw "Password is not a string";
  password = password.trim();
  if (password === "") throw "Password should not be blank spaces";
  if (password.length < 6) throw "Password length is less than four characters";
  if (!password.match(passwordRegex)) throw "Password format should have atleast one uppercase, one lower case, one numeric value and one special character";
  return password;
};

let validateNumber = (num, tex) => {
  if (!num) throw `${tex} should not be empty `;
  if (typeof num != "number") throw `${tex} is not a number`;
  return num;
};

module.exports = { 
  validateId,
  validateText, 
  validateName,
  validateEmail, 
  validatePassword, 
  validateNumber,
  validateString
};