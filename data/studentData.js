const studentDataModule = require("../students.js")

async function getStudentsData(id) {
    let studentData = {};
    studentData = studentDataModule.students.find(user => user._id === id)
    return studentData;
}

async function getStudentsId(email) {    
    let studentData = {};
    studentData = studentDataModule.students.find(user => user.email === email)
    return studentData._id;
}

module.exports = {getStudentsData, getStudentsId}