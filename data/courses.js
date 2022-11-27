const { ObjectId } = require('mongodb');

const mongoCollections = require("../config/mongoCollections");
const courses = mongoCollections.courses;

module.exports = {
    async addCourse(name, courseId, professorname, taname, credits, professoremail, taemail) {
        if (!name || (typeof name != "string")) throw "Name should be string";
        if (!courseId || (typeof courseId != "string")) throw "Name should be string";
        if (!professorname || (typeof professorname != "string")) throw "Professor Name should be string";
        if (!taname || (typeof taname != "string")) throw "TA Name should be string";
        if (!credits || (typeof credits != "number")) throw "Credits should be number";
        if (!professoremail || (typeof professoremail != "string")) throw "Professor email should be string";
        if (!taemail || (typeof taemail != "string")) throw "TA email should be string";
        const courseCollection = await courses();
        let newCourse = {
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
        const insertInfo = await courseCollection.insertOne(newCourse);
        if (insertInfo.insertedCount === 0) throw "could not add courses";
        const newId = insertInfo.insertedId;
        const newIDString = String(newId);
        const course = await this.getCourse(newIDString);
        return course;
    },

    async addCourseWithAdmin(name, courseId, professorname, taname, credits, professoremail, taemail, admin) {
        if (!name || (typeof(name) !== "string")) throw "Error (addCourseWithAdmin): Name should be string.";
        if (!courseId || (typeof(courseId) !== "string")) throw "Error (addCourseWithAdmin): courseId suould be string.";
        if (!professorname || (typeof(professorname) !== "string")) throw "Error (addCourseWithAdmin): Professor name should be string.";
        if (!taname || (typeof(taname) !== "string")) throw "Error (addCourseWithAdmin): TA Name should be string.";
        if (!credits || (typeof(credits) !== "number")) throw "Error (addCourseWithAdmin): Credits shoulbe be string.";
        if (!professoremail || (typeof(professoremail) !== "string")) throw "Error (addCourseWithAdmin): Professor email ahould be string.";
        if (!taemail || (typeof(taemail) !== "string")) throw "Error (addCourseWithAdmin): TA email should be string.";
        if (!admin) throw "Error (addCourseWithAdmin): Admin ID must be included.";
        if (typeof(admin) === "string") admin = ObjectId.createFromHexString(admin);
        const courseCollection = await courses();
        let newCourse = {
            name: name,
            courseId: courseId,
            professorname: professorname,
            taname: taname,
            credits: credits,
            professoremail: professoremail,
            taemail: taemail,
            owner: owner,
            rating: 0,
            reviews: [],
        }
        const insertInfo = await courseCollection.insertOne(newCourse);
        if (insertInfo.insertedCount === 0) throw "Error (addCourseWithAdmin): Failed to add course to DB.";
        const id = insertInfo.insertedId;
        const course = await this.getCourse(id);
        return course;
    },

    async updateCourse(id, name, courseId, professorname, taname, credits, professoremail, taemail) {
        if (!id) throw "Error (updateCourse): Course ID must be included.";
        if (typeof(id) === "string") id = ObjectId.createFromHexString(id);
        if (!name || (typeof(name) !== "string")) throw "Error (updateCourse): Name should be string.";
        if (!courseId || (typeof(courseId) !== "string")) throw "Error (updateCourse): courseId should be string.";
        if (!professorname || (typeof(professorname) !== "string")) throw "Error (updateCourse): Professor name should be string.";
        if (!taname || (typeof(taname) !== "string")) throw "Error (updateCourse): TA Name should be string.";
        if (!credits || (typeof(credits) !== "number")) throw "Error (updateCourse): Credits shoulbe be string.";
        if (!professoremail || (typeof(professoremail) !== "string")) throw "Error (updateCourse): Professor email ahould be string.";
        if (!taemail || (typeof(taemail) !== "string")) throw "Error (updateCourse): TA email should be string.";
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
        const updateInfo = await courseCollection.updateOne({ _id: id }, {$set: updatedCourse});
        if (updateInfo.modifiedCount === 0) throw "Error (updatedCourse): Failed to update course in DB.";
        const course = await this.getCourse(id);
        return course;
    },

    async getCourse(id) {
        if (!id) throw "id must be given";
        if (typeof(id) === "string") id = ObjectId.createFromHexString(id);
        const courseCollection = await courses();
        const course = await courseCollection.findOne({ _id: id});
        if (!course) throw "course with that id does not exist";
        return course;
    },

    async getCoursesViaSearch(search) {
        if (!search) throw "Error (getCoursesViaSearch): Must provide search.";
        if (typeof(search) !== "string") throw "Error (getCoursesViaSearch): Search must be a string.";
        const courseCollection = await courses();
        const query = new RegExp(search, "i");
        const courseList = await courseCollection.find({ $or: [ {category: {$regex: query}}, {name: {$regex: query}} ] }).toArray();
        return courseList;
    },

    async getCoursesByProfessor(ownerId) {
        if (!ownerId) throw "Error (getCoursesByProfessor): Must provide ID of owner to find courses for.";
        if (typeof(ownerId) === "string") ownerId = ObjectId.createFromHexString(ownerId);
        const courseCollection = await courses();
        const courseList = await courseCollection.find({ owner: ownerId }).toArray();
        return courseList;
    },

    async getAllcourses() {
        const courseCollection = await courses();
        const courseList = await courseCollection.find({}).toArray();
        if (courseList.length === 0) throw "no courses in the collection";
        return courseList;
    },
    
    async checkcourseOwnership(courseId, studentId) {
        if (!studentId) throw "Error (checkcourseOwnership): Must provide ID of user to check.";
        if (!courseId) throw "Error (checkcourseOwnership): Must provide ID of course to check.";
        if (typeof(studentId) === "string") studentId = ObjectId.createFromHexString(studentId);
        if (typeof(courseId) === "string") courseId = ObjectId.createFromHexString(courseId);
        const courseCollection = await courses();
        const courseList = await courseCollection.find({ owner: studentId }).toArray();
        for (let cs of courseList) {
            if (courseId === cs._id) {
                return true; // Break, course is in user's owned list
            }
        }
        return false; // Students does not own course
    }
}