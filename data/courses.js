const mongoCollections = require("../config/mongoCollections");
const courses = mongoCollections.courses;
const admin = mongoCollections.admin;
const { ObjectId } = require('mongodb');
const bcrypt = require("bcryptjs");
const validate = require('../helper');
const saltRounds = 16;

module.exports = {
    async addCourse(name, courseId, credits, professorName, professorEmail, taName,  taEmail) {
        name = await validate.validateName(name, "course Name");
        courseId = await validate.validateString(courseId, "courseId");
        professorName = await validate.validateName(professorName, "Profesor Name");
        taName = await validate.validateName(taName, "TA Name");
        professorEmail = await validate.validateEmail(professorEmail, "Professor Email");
        taEmail = await validate.validateEmail(taEmail, "TA Email");
        if (!credits) throw "Credits should not be empty";
        const courseCollection = await courses();
        let addNewCoursebyAdmin = {
            name: name,
            courseId: courseId,
            professorName: professorName,
            taName: taName,
            credits: credits,
            professorEmail: professorEmail,
            taEmail: taEmail,
            rating: 0,
            reviews: [],
        }
        const insertInfo = await courseCollection.insertOne(addNewCoursebyAdmin);
        if (!insertInfo.acknowledged || !insertInfo.insertedId) {
            throw 'Could not add new course';
        }
        const newId = insertInfo.insertedId.toString();
        const course = await this.getCourse(newId);
        return course;
    },

    async getAllcourses() {
        const courseCollection = await courses();
        const allCourses = await courseCollection.find({}).toArray();
        if (!allCourses) throw "There are no courses";
        return allCourses;
    },

    async getCourse(id) {
        id = await validate.validateId(id);
        const courseCollection = await courses();
        const course = await courseCollection.findOne({ _id: ObjectId(id) });
        if (!course) throw `No course exists with the ${id}`;
        return course;
    },

    async updateCourse(id, name, courseId, credits, professorName, professorEmail, taName, taEmail) {
        id = await validate.validateId(id, "id");
        name = await validate.validateName(name, "course Name");
        courseId = await validate.validateId(courseId, "courseId");
        professorName = await validate.validateName(professorName, "Profesor Name");
        taName = await validate.validateName(taName, "TA Name");
        professorEmail = await validate.validateEmail(professorEmail, "Professor Email");
        taEmail = await validate.validateEmail(taEmail, "TA Email");
        if (!credits) throw "Credits should not be empty";
        const courseCollection = await courses();
        let updatedCourse = {
            name: name,
            courseId: courseId,
            professorName: professorName,
            taName: taName,
            credits: credits,
            professorEmail: professorEmail,
            taEmail: taEmail
        }
        const updateInfo = await courseCollection.updateOne({ 
            _id: ObjectId(id) 
        }, {
             $set: updatedCourse 
            });
        if (!updateInfo.modifiedCount) throw "Could not update course";
        const course = await this.getCourse(ObjectId(id));
        return course;
    },

    async getCoursesFromSearch(search) {
        search = validate.validateString(search, "Search");
        const courseCollection = await courses();
        const regSearch = new RegExp(search, "i");
        const allCourses = await courseCollection.find({ name: { $regex: regSearch } }).toArray();;
        return allCourses;
    },
    async checkAdmin(email, password) {
        email = validate.validateEmail(email, "Email");
        password = validate.validatePassword(password);
        email = email.toLowerCase();
        const adminCollection = await admin();
        const adm = await adminCollection.findOne({ email: email });
        console.log(adm)
        if (adm) { 
          const passwordMatch = await bcrypt.compare(password, adm.hashedPassword);
          if (passwordMatch){
            return { checkedAdmin: true };
          }else
            throw "Either the email or password is invalid";
        } else
        throw "Either the email or password is invalid";
    },
    async addAdmin(email, password) {
        email = validate.validateEmail(email, "Email");
        password = validate.validatePassword(password);
       const adminCollection = await admin();
       email = email.toLowerCase();
       const adm = await adminCollection.findOne({ email: email });
       const passwordHash = await bcrypt.hash(password, saltRounds);
       if (!adm) {
           let newAdmin = {
               email: email,
               hashedPassword: passwordHash
           }
           const insertInfo = await adminCollection.insertOne(newAdmin);
           if (!insertInfo.acknowledged || !insertInfo.insertedId) throw "Not able to add new admin";
            return {insertedAdmin: true};
       } else
           throw "Please try with other email. This email is already registered.";
   },
}