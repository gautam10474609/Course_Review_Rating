const mongoCollections = require("../config/mongoCollections");
const courses = mongoCollections.courses;
const admin = mongoCollections.admin;
const { ObjectId } = require('mongodb');
const bcrypt = require("bcryptjs");
const validate = require('../helper');
const saltRounds = 16;

module.exports = {
    async createCourse(name, courseId, credits, professorName, professorEmail, taName, taEmail) {
        name = await validate.validateName("createCourse", name, "course Name");
        courseId = await validate.validateString("createCourse", courseId, "courseId");
        professorName = await validate.validateName("createCourse", professorName, "Profesor Name");
        taName = await validate.validateName("createCourse", taName, "TA Name");
        professorEmail = await validate.validateEmail("createCourse", professorEmail, "Professor Email");
        taEmail = await validate.validateEmail("createCourse", taEmail, "TA Email");
        if (!credits) throw "createCourse: Credits should not be empty";
        const courseCollection = await courses();
        const getCourseData = await courseCollection.findOne({
            name: {
                $regex: new RegExp(name, "i")
            }, courseId: {
                $regex: new RegExp(courseId, "i")
            }
        });
        if (!getCourseData) {
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
                throw 'createCourse: Could not add new course';
            }
            const newId = insertInfo.insertedId.toString();
            const course = await this.getCourse(newId);
            return course;
        } else {
            throw "createCourse: Course is already available"
        }
    },

    async getAllcourses() {
        const courseCollection = await courses();
        const allCourses = await courseCollection.find({}).toArray();
        if (!allCourses) throw "getAllcourses: There are no courses";
        return allCourses;
    },

    async getCourse(id) {
        id = await validate.validateId("get Course", id, "Id");
        const courseCollection = await courses();
        const course = await courseCollection.findOne({ _id: ObjectId(id) });
        if (!course) throw `getCourse: No course exists with the ${id}`;
        return course;
    },

    async updateCourse(id, name, courseId, credits, professorName, professorEmail, taName, taEmail) {
        id = await validate.validateId("updateCourse", id, "id");
        name = await validate.validateName("updateCourse", name, "course Name");
        courseId = await validate.validateString("updateCourse", courseId, "courseId");
        professorName = await validate.validateName("updateCourse", professorName, "Profesor Name");
        taName = await validate.validateName("updateCourse", taName, "TA Name");
        professorEmail = await validate.validateEmail("updateCourse", professorEmail, "Professor Email");
        taEmail = await validate.validateEmail("updateCourse", taEmail, "TA Email");
        if (!credits) throw "updateCourse: Credits should not be empty";
        const courseCollection = await courses();
        let updatedCourse = {
            id: id,
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
        if (!updateInfo.modifiedCount) throw "updateCourse: Could not update course";
        const course = await this.getCourse(id);
        return course;
    },

    async checkAdmin(email, password) {
        email = validate.validateEmail("checkAdmin", email, "Email");
        password = validate.validatePassword("checkAdmin", password);
        email = email.toLowerCase();
        const adminCollection = await admin();
        const adm = await adminCollection.findOne({ email: email });
        if (adm) {
            const passwordMatch = await bcrypt.compare(password, adm.hashedPassword);
            if (passwordMatch) {
                return { checkedAdmin: true };
            } else
                throw "checkAdmin: Either the email or password is invalid";
        } else
            throw "checkAdmin: Either the email or password is invalid";
    },
    async addAdmin(email, password) {
        email = validate.validateEmail("addAdmin", email, "Email");
        password = validate.validatePassword("addAdmin", password);
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
            if (!insertInfo.acknowledged || !insertInfo.insertedId) throw "addAdmin: Not able to add new admin";
            return { insertedAdmin: true };
        } else
            throw "addAdmin: Please try with other email. This email is already registered.";
    },
}