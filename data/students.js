const mongoCollections = require("../config/mongoCollections");
const students = mongoCollections.students;
const bcrypt = require("bcryptjs");
const validate = require('../helper');
const saltRounds = 16;
const { ObjectId } = require('mongodb');

module.exports = {
    async addStudents(firstName, lastName, email, password) {
         firstName = validate.validateName(firstName, "First Name");
         lastName = validate.validateName(lastName, "Last Name");
         email = validate.validateEmail(email, "Email");
         password = validate.validatePassword(password);
        const studentCollection = await students();
        email = email.toLowerCase();
        const student = await studentCollection.findOne({ email: email });
        const passwordHash = await bcrypt.hash(password, saltRounds);
        if (!student) {
            let newStudents = {
                firstName: firstName,
                lastName: lastName,
                email: email,
                hashedPassword: passwordHash,
                reviewIds: [],
                commentIds: []
            }
            const insertInfo = await studentCollection.insertOne(newStudents);
            if (!insertInfo.acknowledged || !insertInfo.insertedId) throw "Not able to add new student";
             return await this.getStudents(insertInfo.insertedId.toString());
        } else
            throw "Please try with other email. This email is already registered.";
    },

    async getAllStudents() {
        const studentCollection = await students();
        const studentList = await studentCollection.find({}).toArray();
        if (!studentList) throw "No students available";
        return studentList;
    },

    async getStudents(id) {
        id = validate.validateId(id, "Student Id");
        const studentCollection = await students();
        const student = await studentCollection.findOne({ _id: ObjectId(id) });
        if (!student) throw "Student with the id does not exists";
        return student;
    },

    async getStudentsId(email) {
        email = validate.validateEmail(email, "Email");
        email = email.toLowerCase()
        const studentCollection = await students();
        const studentData = await studentCollection.findOne({ email: email });
        return studentData._id;
    },

    async checkStudent(email, password) {
        email = validate.validateEmail(email, "Email");
        password = validate.validatePassword(password);
        const studentCollection = await students();
        email = email.toLowerCase();
        const student = await studentCollection.findOne({ email: email });
        if (student) { 
          const samePassord = await bcrypt.compare(password, student.hashedPassword);
          if (samePassord){
            
            return { student: student };
          }else
            throw "Either the email or password is invalid";
        } else
        throw "Either the email or password is invalid";
    },
}