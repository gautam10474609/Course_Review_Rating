const { ObjectId } = require('mongodb');

const mongoCollections = require("../config/mongoCollections");
const courses = mongoCollections.courses;
// const uuid = require('uuid/v4');

module.exports = {
    async addCourse(name, website, category, address, city, state, zip, latitude, longitude) {
        if (!name || (typeof name != "string")) throw "must give name as a string";
        if (!website || (typeof website != "string")) throw "must give website as a string";
        if (!category || (typeof category != "string")) throw "must give category as a string";
        if (!address || (typeof address != "string")) throw "must give address as a string";
        if (!city || (typeof city != "string")) throw "must give city as a string";
        if (!state || (typeof state != "string")) throw "must give state as a string";
        if (!zip || (typeof zip != "string")) throw "must give zip as a string";
        if (!longitude || (typeof longitude != "number")) throw "must give longitude as a number";
        if (!latitude || (typeof latitude != "number")) throw "must give latitude as a number";
        const courseCollection = await courses();
        let newCourse = {
            name: name,
            website: website,
            category: category,
            address: address,
            city: city,
            state: state,
            zip: zip,
            longitude: longitude,
            latitude: latitude,            
            owner: "",
            rating: 0,
            reviews: [],
        }
        const insertInfo = await courseCollection.insertOne(newCourses);
        if (insertInfo.insertedCount === 0) throw "could not add courses";
        const newId = insertInfo.insertedId;
        const newIDString = String(newId);
        const course = await this.getCourse(newIDString);
        return course;
    },

    async addCourseWithAdmin(name, website, category, address, city, state, zip, latitude, longitude, owner) {
        if (!name || (typeof(name) !== "string")) throw "Error (addCourseWithAdmin): Name must be included as a string.";
        if (!website || (typeof(website) !== "string")) throw "Error (addCourseWithAdmin): Website must be included as a string.";
        if (!category || (typeof(category) !== "string")) throw "Error (addCourseWithAdmin): Category must be included as a string.";
        if (!address || (typeof(address) !== "string")) throw "Error (addCourseWithAdmin): Address must be included as a string.";
        if (!city || (typeof(city) !== "string")) throw "Error (addCourseWithAdmin): City must be included as a string.";
        if (!state || (typeof(state) !== "string")) throw "Error (addCourseWithAdmin): State must be included as a string.";
        if (!zip || (typeof(zip) !== "string")) throw "Error (addCourseWithAdmin): Zip must be included as a string.";
        if (!longitude || (typeof(longitude) !== "number")) throw "Error (addCourseWithAdmin): Longitude must be included as a float.";
        if (!latitude || (typeof(latitude) !== "number")) throw "Error (addCourseWithAdmin): Latitude must be included as a float.";
        if (!owner) throw "Error (addCourseWithAdmin): Owner ID must be included.";
        if (typeof(owner) === "string") owner = ObjectId.createFromHexString(owner);
        const courseCollection = await courses();
        let newCourse = {
            name: name,
            website: website,
            category: category,
            address: address,
            city: city,
            state: state,
            zip: zip,
            longitude: longitude,
            latitude: latitude,
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

    async updateCourse(id, name, website, category, address, city, state, zip, latitude, longitude) {
        if (!id) throw "Error (updateCourse): Course ID must be included.";
        if (typeof(id) === "string") id = ObjectId.createFromHexString(id);
        if (!name || (typeof(name) !== "string")) throw "Error (updateCourse): Name must be included as a string.";
        if (!website || (typeof(website) !== "string")) throw "Error (updateCourse): Website must be included as a string.";
        if (!category || (typeof(category) !== "string")) throw "Error (updateCourse): Category must be included as a string.";
        if (!address || (typeof(address) !== "string")) throw "Error (updateCourse): Address must be included as a string.";
        if (!city || (typeof(city) !== "string")) throw "Error (updateCourse): City must be included as a string.";
        if (!state || (typeof(state) !== "string")) throw "Error (updateCourse): State must be included as a string.";
        if (!zip || (typeof(zip) !== "string")) throw "Error (updateCourse): Zip must be included as a string.";
        if (!longitude || (typeof(longitude) !== "number")) throw "Error (updateCourse): Longitude must be included as a float.";
        if (!latitude || (typeof(latitude) !== "number")) throw "Error (updateCourse): Latitude must be included as a float.";
        const courseCollection = await courses();
        let updatedCourse = {
            name: name,
            website: website,
            category: category,
            address: address,
            city: city,
            state: state,
            zip: zip,
            longitude: longitude,
            latitude: latitude
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
    
    async checkcourseOwnership(courseId, userId) {
        if (!userId) throw "Error (checkcourseOwnership): Must provide ID of user to check.";
        if (!courseId) throw "Error (checkcourseOwnership): Must provide ID of course to check.";
        if (typeof(userId) === "string") userId = ObjectId.createFromHexString(userId);
        if (typeof(courseId) === "string") courseId = ObjectId.createFromHexString(courseId);
        const courseCollection = await courses();
        const courseList = await courseCollection.find({ owner: userId }).toArray();
        for (course of courseList) {
            if (courseId === course._id) {
                return true; // Break, course is in user's owned list
            }
        }
        return false; // Students does not own course
    }
}