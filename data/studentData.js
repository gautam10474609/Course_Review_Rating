const studentDataModule = require("../students.js")

async function getStudentsData(id) {
    let studentData = {};
    studentData = studentDataModule.students.find(user => user._id === id)
    return studentData;
}

async function getStudentsId(username) {    
    let studentData = {};
    studentData = studentDataModule.students.find(user => user.username === username)
    return studentData._id;
}

module.exports = {getStudentsData, getStudentsId}