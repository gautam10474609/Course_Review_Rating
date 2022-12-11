const mongoCollections = require("../config/mongoCollections");
const reviews = mongoCollections.reviews;
const courses = mongoCollections.courses;
const students = mongoCollections.students;
const comments = mongoCollections.comments;
const validate = require('../helper');
const { ObjectId } = require('mongodb');

module.exports = {
    async addReview(courseId, studentId, reviewText, rating) {
        id = validate.validateId(studentId, "studentId");
        id = validate.validateId(courseId, "courseId");
        reviewText = validate.validateText(reviewText, "reviewText")
        rating = validate.validateNumber(rating, "rating")
        if (rating < 1 || rating > 5)  throw "Rating should be between 1 and 5";
         
        const courseCollection = await courses();
        const reviewCollection = await reviews();
        const studentsCollection = await students();
        
        let newReviewData = {
            courseId: courseId,
            studentId: studentId,
            reviewText: reviewText,
            rating: rating,
            comments: []
        }
        const alreadyReviewed = await reviewCollection.findOne({ 
            $and: [{
                courseId: courseId
            }, {
                studentId: studentId
            }]
        });
        if (alreadyReviewed) throw "Student already reviewed this course";
        
        const insertInfo = await reviewCollection.insertOne(newReviewData);
        if (!insertInfo.acknowledged || !insertInfo.insertedId)throw 'Could not add new Review';
        else {
            const courseInfo = await courseCollection.updateOne({ _id: ObjectId.createFromHexString(courseId) }, { $push: { reviews: newReviewData._id.toString() } });
            if (courseInfo.modifiedCount === 0) throw 'Could not update course Collection with Review Data!';
            const studentInfo = await studentsCollection.updateOne({ _id: ObjectId.createFromHexString(studentId) }, { $push: { reviewIds: newReviewData._id.toString() } });
            if (studentInfo.modifiedCount === 0) throw 'Could not update Studentss Collection with Review Data!';
        }
        var newId = String(insertInfo.insertedId);
        const review = await this.getReview(newId);
        return review;
    },

    async getReview(id) {
        id = validate.validateId(id, "id");
        const reviewCollection = await reviews();
        const review = await reviewCollection.findOne({ _id: ObjectId.createFromHexString(id)});
        if (!review) throw `No review exists with the ${id}`;
        return review;
    },

    async getAllReviews() {
        const reviewCollection = await reviews();
        const reviewList = await reviewCollection.find({}).toArray();
        if (!reviewList) throw "No reviews available";
        return reviewList;
    },

    async updateReview(id, reviewText, rating) {
        id = validate.validateId(id, "review Id");
        reviewText = validate.validateText(reviewText, "reviewText")
        rating = validate.validateNumber(rating, "rating")
        const reviewCollection = await reviews();
        const updatedReview = {};
        updatedReview.reviewText = reviewText;
        updatedReview.rating = rating;
        updateReviewData = await reviewCollection.updateOne({_id: ObjectId.createFromHexString(id)}, {$set: updatedReview});
        if (!updateReviewData.matchedCount && !updateReviewData.modifiedCount) throw "Update of review failed";
        return await this.getReview(ObjectId.createFromHexString(id));
    },

    async removeReview(id) {
        id = validate.validateId(id, "review Id");
        const reviewcollection = await reviews();
        const commentCollection = await comments();
        const studentColection = await students();
        const courseCollection = await courses();
        const getRev = await reviewcollection.findOne({_id: ObjectId.createFromHexString(id)});
        const listOFComments = getRev.comments;
        if (!getRev) throw `No Review with ${id}`;
        if (!listOFComments) {
           for(let i in listOFComments)
                try {
                    const deleteCommInfo = await commentCollection.deleteOne({_id: ObjectId.createFromHexString(i)});
                    if (deleteCommInfo.deletedCount === 0) throw `Could not delete Comment ${i}`;
                } catch (e){
                    throw 'Could not delete comment from review';
                }  
        }
        try {
            const deleteRevFromStuInfo = await studentColection.updateOne({ _id: ObjectId.createFromHexString(getRev.studentId) }, { $pull: { reviewIds: String(id) } });
            if (deleteRevFromStuInfo.deletedCount === 0) throw `Could not delete review ${id}`;
        } catch (e) {
            throw "Could not delete review from students";
        }
        try { 
           const deleteReviewFromCourse = await courseCollection.updateOne({ _id: ObjectId.createFromHexString(getRev.courseId) }, { $pull: { reviews: String(id) } });
            if (deleteReviewFromCourse.deletedCount === 0) throw `Could not delete Review ${id}`;
        } catch (e) {
            throw `Could not delete review from course`;
        }
        const deleteReviewInfo = await reviewcollection.deleteOne({_id: ObjectId.createFromHexString(id)});
        if (deleteReviewInfo.deletedCount === 0) throw `Could not delete Review  ${ObjectId.createFromHexString(id)}`;
            return true;
        }
    }