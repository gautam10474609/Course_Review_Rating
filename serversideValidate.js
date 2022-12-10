let validateId = (id) => {
        if (!id) throw 'Must provide valid id';
        if (typeof id !== 'string') throw 'id must be a string';
        if (id.trim().length === 0) throw 'id cannot be an empty string or just spaces';
        id = id.trim();
        return id
  };

let validateFirstName = (firstName) => {
    if (!firstName || typeof firstName !== "string") throw "firstName should not be empty";
    if (typeof firstName !== "string") throw "firstName is not a string";
    firstName = firstName.trim();
    if (firstName === "") throw "firstName should not be blank spaces";
    if (firstName.length < 4) throw "firstName length is less than four characters";
    const regex = new RegExp('^[A-Za-z0-9]+$');
    if (!firstName.match(regex)) throw "firstName should be alphanumeric value";
    return firstName;
  };

  let validateLastName = (lastName) => {
    if (!lastName || typeof lastName !== "string") throw "lastName should not be empty";
    if (typeof lastName !== "string") throw "lastName is not a string";
    lastName = lastName.trim();
    if (lastName === "") throw "lastName should not be blank spaces";
    if (lastName.length < 4) throw "lastName length is less than four characters";
    const regex = new RegExp('^[A-Za-z0-9]+$');
    if (!lastName.match(regex)) throw "lastName should be alphanumeric value";
    return lastName;
  };
  let validateEmail = (email) => {
    if (!email) throw "email should not be empty";
    if (typeof email !== "string") throw "email is not a string";
    email = email.trim();
    if (email === "") throw "email should not be blank spaces";
    const emailRegex = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/;
    if(!emailRegex.test(email))  throw "email is not proper format";
    return email
  };

  let validatePassword = (password) => {
    if (!password) throw "Password should not be empty";
    if (typeof password !== "string") throw "Password is not a string";
    password = password.trim();
    if (password === "") throw "Password should not be blank spaces";
    if (password.length < 6) throw "Password length is less than four characters";
    const passwordRegex = new RegExp('^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{6,}$')
    if (!password.match(passwordRegex)) throw "Password format should have atleast one uppercase, one lower case, one numeric value and one special character";
    return password;
  };

  module.exports = {validateId, validateFirstName,  validateLastName, validateEmail, validatePassword};

