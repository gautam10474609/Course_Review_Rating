const mongoCollections = require("../config/mongoCollections");
const { ObjectId } = require("mongodb");
const students = mongoCollections.students;
const bcrypt = require("bcryptjs");
const validate = require('../serversideValidate');
const saltRounds = 16;

module.exports = {
    async addStudents(firstName, lastName, email, password) {
         firstName = validate.validateFirstName(firstName);
         lastName = validate.validateFirstName(lastName);
         email = validate.validateEmail(email);
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
            if (insertInfo.insertedCount === 0) throw "could not add user";
             return await this.getStudents(insertInfo.insertedId.toString());
        } else
            throw "Email is already registered.";
    },

    async getAllStudents() {
        const studentCollection = await students();
        const studentList = await studentCollection.find({}).toArray();
        if (studentList.length === 0) throw "There are no students";
        return studentList;
    },

    async getStudents(id) {
         id = validate.validateId(id);
         if (!ObjectId.isValid(id)) throw 'invalid object ID';
         console.log(id);
        const studentCollection = await students();
        const student = await studentCollection.findOne({ _id: ObjectId(id) });
        if (!student) throw "Student does not exists";
       
        return student;
    },

    async getStudentsId(email) {
         email = validate.validateId(email);
        email = email.toLowerCase()
        const studentCollection = await students();
        const studentData = await studentCollection.findOne({ email: email });
        return studentData._id;
    },

    async updateStudents(id, updatedStudents) {
         id = validate.validateId(id);
         if (!ObjectId.isValid(id)) throw 'invalid object ID';
        if (!updatedStudents) {
            return await this.getStudents(id);
        }
        let firstName = validate.validateFirstName(updatedStudents.firstName);
        let lastName = validate.validateLastName(updatedStudents.lastName);
        let email = validate.validateEmail(updatedStudents.email);
        let password = validate.validatePassword(updatedStudents.password);
        const studentCollection = await students();

        let updatedStudentsData = {};
        let studentDetails = await this.getStudents(id);
        if (JSON.stringify(updatedStudents) == JSON.stringify(studentDetails)) {
            return await this.getStudents(id);
        }
        updatedStudentsData.firstName = firstName;
        updatedStudentsData.lastName = lastName;
        updatedStudentsData.email = email;
        updatedStudentsData.hashedPassword = password;
        if (updatedStudentsData == {})
            return await this.getStudents(id);
        const updateInfoStudents = await studentCollection.updateOne({ _id: id }, { $set: updatedStudentsData });
        if (updateInfoStudents.modifiedCount === 0 && updateInfoStudents.deletedCount === 0) throw "could not able to update students";
        return await this.getStudents(id);
    },
    async checkStudent(email, password) {
         email = validate.validateEmail(email);
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