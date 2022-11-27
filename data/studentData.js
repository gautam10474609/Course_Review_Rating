const userDataModule = require("../students.js")

async function getStudentsData(id) {
    let userData = {};
    userData = userDataModule.students.find(user => user._id === id)
    return userData;
}

async function getStudentsId(username) {    
    let userData = {};
    userData = userDataModule.students.find(user => user.username === username)
    return userData._id;
}

module.exports = {getStudentsData, getStudentsId}