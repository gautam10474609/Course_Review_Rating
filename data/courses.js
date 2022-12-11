const mongoCollections = require("../config/mongoCollections");
const courses = mongoCollections.courses;
const validate = require('../helper');
let { ObjectId } = require('mongodb');

module.exports = {
    async addCourse(name, courseId, professorname, taname, credits, professoremail, taemail) {
        name = validate.validateName(name, "course Name");
        courseId = validate.validateEmail(courseId, "courseId");
        professorname = validate.validateName(professorname, "Profesor Name");
        taname = validate.validateName(taname, "TA Name");
        professoremail = validate.validateEmail(professoremail, "Professor Email");
        taemail = validate.validateEmail(taemail, "TA Email");
        if (!credits) throw "Credits should not be empty";
        const courseCollection = await courses();
        let addNewCourse = {
            name: name,
            courseId: courseId,
            professorname: professorname,
            taname: taname,
            credits: credits,
            professoremail: professoremail,
            taemail: taemail,
            admin: "",
            rating: 0,
            reviews: [],
        }
        const insertInfo = await courseCollection.insertOne(addNewCourse);
        if (!insertInfo.acknowledged || !insertInfo.insertedId) {
            throw 'Could not add new course';
        }
        const newId = insertInfo.insertedId.toString();
        const course = await this.getCourse(newId);
        return course;
    },

    async addCourseByAdmin(name, courseId, professorname, taname, credits, professoremail, taemail, admin) {
        name = validate.validateName(name, "course Name");
        courseId = validate.validateEmail(courseId, "courseId");
        professorname = validate.validateName(professorname, "Profesor Name");
        taname = validate.validateName(taname, "TA Name");
        professoremail = validate.validateEmail(professoremail, "Professor Email");
        taemail = validate.validateEmail(taemail, "TA Email");
        if (!credits) throw "Credits should not be empty";
        if (!admin || typeof admin !== "string") throw "Admin should not be empty";
        admin = ObjectId.createFromHexString(admin);
        const courseCollection = await courses();
        let addNewCoursebyAdmin = {
            name: name,
            courseId: courseId,
            professorname: professorname,
            taname: taname,
            credits: credits,
            professoremail: professoremail,
            taemail: taemail,
            admin: admin,
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
        id = validate.validateId(id);
        if (!ObjectId.isValid(id)) throw 'invalid object id';
        const courseCollection = await courses();
        const course = await courseCollection.findOne({ _id: ObjectId(id) });
        if (!course) throw `No course exists with the ${id}`;
        return course;
    },

    async updateCourse(id, name, courseId, professorname, taname, credits, professoremail, taemail) {
        id = validate.validateId(id, "id");
        if (!ObjectId.isValid(id)) throw 'invalid object id';
        name = validate.validateName(name, "course Name");
        courseId = validate.validateEmail(courseId, "courseId");
        professorname = validate.validateName(professorname, "Profesor Name");
        taname = validate.validateName(taname, "TA Name");
        professoremail = validate.validateEmail(professoremail, "Professor Email");
        taemail = validate.validateEmail(taemail, "TA Email");
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
    }
}