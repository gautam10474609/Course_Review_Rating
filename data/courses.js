const mongoCollections = require("../config/mongoCollections");
const courses = mongoCollections.courses;
const validate = require('../helper');
const { ObjectId } = require('mongodb');

module.exports = {
    async addCourse(name, courseId, credits, professorname, professoremail, taname,  taemail) {
        name = await validate.validateName(name, "course Name");
        courseId = await validate.validateString(courseId, "courseId");
        professorname = await validate.validateName(professorname, "Profesor Name");
        taname = await validate.validateName(taname, "TA Name");
        professoremail = await validate.validateEmail(professoremail, "Professor Email");
        taemail = await validate.validateEmail(taemail, "TA Email");
        if (!credits) throw "Credits should not be empty";
        const courseCollection = await courses();
        let addNewCoursebyAdmin = {
            name: name,
            courseId: courseId,
            professorname: professorname,
            taname: taname,
            credits: credits,
            professoremail: professoremail,
            taemail: taemail,
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

    async updateCourse(id, name, courseId, credits, professorname, professoremail, taname, taemail) {
        id = await validate.validateId(id, "id");
        name = await validate.validateName(name, "course Name");
        courseId = await validate.validateId(courseId, "courseId");
        professorname = await validate.validateName(professorname, "Profesor Name");
        taname = await validate.validateName(taname, "TA Name");
        professoremail = await validate.validateEmail(professoremail, "Professor Email");
        taemail = await validate.validateEmail(taemail, "TA Email");
        if (!credits) throw "Credits should not be empty";
        const courseCollection = await courses();
        let updatedCourse = {
            name: name,
            courseId: courseId,
            professorname: professorname,
            taname: taname,
            credits: credits,
            professoremail: professoremail,
            taemail: taemail
        }
        const updateInfo = await courseCollection.updateOne({ _id: ObjectId.createFromHexString(id) }, { $set: updatedCourse });
        if (!updateInfo.modifiedCount) throw "Could not update course";
        const course = await this.getCourse(ObjectId.createFromHexString(id));
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
        if (email === "admin@gmail.com" && password === "Admin@123") { 
            return { insertedAdmin: true };
        } else
        throw "Either the email or password is invalid";
    },
}