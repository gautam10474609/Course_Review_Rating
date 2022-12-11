const studentDataModule = require("../students.js")

async function getStudentsData(id) {
    let studentData = {};
    studentData = studentDataModule.students.find(student => student._id === id)
    return studentData;
}

async function getStudentsId(email) {    
    let studentData = {};
    studentData = studentDataModule.students.find(student => student.email === email)
    return studentData._id;
}

module.exports = {getStudentsData, getStudentsId}