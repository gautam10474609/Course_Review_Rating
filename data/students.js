const { ObjectId } = require('mongodb');
const mongoCollections = require("../config/mongoCollections");

const students = mongoCollections.students;
const reviews = mongoCollections.reviews;
const comments = mongoCollections.comments;
// const uuid = require('uuid/v4');

module.exports = {
    async addStudents(firstName, lastName, email, hashedPassword) {
        if (!firstName || (typeof firstName != "string")) throw "must give first name as a string";
        if (!lastName || (typeof lastName != "string")) throw "must give last name as a string";
        if (!email || (typeof email != "string")) throw "must give email as a string";
        if (!hashedPassword || (typeof hashedPassword != "string")) throw "must give hashed password as a string";
        const userCollection = await students();
        var emailLowerCase = email.toLowerCase();
        let newStudents = {
            firstName: firstName,
            lastName: lastName,
            email: emailLowerCase,
            hashedPassword: hashedPassword,
            reviewIds: [],
            commentIds: []
        }

        const userExists = await userCollection.findOne({ email: emailLowerCase});
        if (userExists) throw "Email already in use";
        const insertInfo = await userCollection.insertOne(newStudents);
        if (insertInfo.insertedCount === 0) throw "could not add user";
        return await this.getStudents(insertInfo.insertedId);
    },

    async addStudentsProfilePicture(id, profilePicture) {
        if (!id) throw "Students id is missing";
        var objRevId = ""
        if (typeof(id) === "string") objRevId = ObjectId.createFromHexString(id);
        const userCollection = await students();
        let updatedStudentsData = {};
        let gotten = await this.getStudents(objRevId);
        updatedStudentsData.profilePicture = profilePicture;
        const updateInfoStudents = await userCollection.updateOne({ _id: objRevId }, { $set: updatedStudentsData });
        if (updateInfoStudents.modifiedCount === 0 && updateInfoStudents.deletedCount === 0) throw "could not update user";
        return await this.getStudents(id);
    },

    async getStudents(id) {
        if (!id) throw "id must be given";
        if (typeof(id) === "string") id = ObjectId.createFromHexString(id);
        const userCollection = await students();
        const user = await userCollection.findOne({ _id: id});
        if (!user) throw "user with that id does not exist";
        return user;
    },

    async getAllStudentss() {
        const userCollection = await students();
        const userList = await userCollection.find({}).toArray();
        if (userList.length === 0) throw "no students in the collection";
        return userList;
    },

    async getStudentsId(username) {    
        if (!username) throw "username must be given";
        const userCollection = await students();
        const studentData = await userCollection.findOne({ email: username});
        return studentData._id;
    },

    async updateStudents(id, updatedStudents) {
        if (!id) throw "id is missing";
        if (!updatedStudents) {
            return await this.getStudents(id);
        }
        if (typeof(id) === "string") id = ObjectId.createFromHexString(id);
        const userCollection = await students();
        let updatedStudentsData = {};
        let gotten = await this.getStudents(id);
        if (JSON.stringify(updatedStudents) == JSON.stringify(gotten)) {
            return await this.getStudents(id);
        }

        if (updatedStudents.firstName) {
            updatedStudentsData.firstName = updatedStudents.firstName;
        }
        if (updatedStudents.lastName) {
            updatedStudentsData.lastName = updatedStudents.lastName;
        }
        if (updatedStudents.email) {
            updatedStudentsData.email = updatedStudents.email;
        }
        if (updatedStudents.hashedPassword) {
            updatedStudentsData.hashedPassword = updatedStudents.hashedPassword;
        }

        if (updatedStudentsData == {}) {
            return await this.getStudents(id);
        }
        const updateInfoStudents = await userCollection.updateOne({ _id: id }, { $set: updatedStudentsData });
        if (updateInfoStudents.modifiedCount === 0 && updateInfoStudents.deletedCount === 0) throw "could not update user";
        return await this.getStudents(id);
    }
}