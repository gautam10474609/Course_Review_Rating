const mongoCollections = require("../config/mongoCollections");
const reviews = mongoCollections.reviews;
const courses = mongoCollections.courses;
const students = mongoCollections.students;
const comments = mongoCollections.comments;
const validate = require('../helper');
let { ObjectId } = require('mongodb');

module.exports = {
    async addReview(courseId, studentId, reviewText, rating) {
        id = validate.validateId(studentId, "studentId");
        if (!ObjectId.isValid(studentId)) throw 'invalid object studentId';
        id = validate.validateId(courseId, "courseId");
        if (!ObjectId.isValid(courseId)) throw 'invalid object courseId';
        reviewText = validate.validateText(reviewText, "reviewText")
        rating = validate.validateNumber(rating, "rating")
        if (rating < 1 || rating > 5) 
            throw "Rating should be between 1 and 5";
         
        const reviewCollection = await reviews();
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
        if (alreadyReviewed) throw "This user already reviewed this course";
        const insertInfo = await reviewCollection.insertOne(newReviewData);
        const courseCollection = await courses();
        const studentsCollection = await students();
        const _courseId = ObjectId.createFromHexString(courseId);
        const _studentId = ObjectId.createFromHexString(studentId);

        
        if (insertInfo.insertedCount === 0) {
            throw 'Could not add new Review';
        } else {
            const courseInfo = await courseCollection.updateOne({ _id: _courseId }, { $push: { reviews: newReviewData._id.toString() } });
            if (courseInfo.modifiedCount === 0) {
                throw 'Could not update course Collection with Review Data!';
            }
            const studentInfo = await studentsCollection.updateOne({ _id: _studentId }, { $push: { reviewIds: newReviewData._id.toString() } });
            if (studentInfo.modifiedCount === 0) {
                throw 'Could not update Studentss Collection with Review Data!';
            }
        }
        var newId = String(insertInfo.insertedId);
        const review = await this.getReview(newId);
        return review;
    },

    async getReview(id) {
        if (!id) throw "id must be given";
        if (typeof(id) === "string") id = ObjectId.createFromHexString(id);
        const reviewCollection = await reviews();
        const review = await reviewCollection.findOne({ _id: id});
        if (!review) throw "review with that id does not exist";
        return review;
    },

    async getAllReviews() {
        const reviewCollection = await reviews();
        const reviewList = await reviewCollection.find({}).toArray();
        if (reviewList.length === 0) throw "no reviews in the collection";
        return reviewList;
    },

    async updateReview(id, updatedReview) {
        if (typeof(id) === "string") id = ObjectId.createFromHexString(id);
        const reviewCollection = await reviews();
        const updatedReviewData = {};
        if (updatedReview.reviewText) {
            updatedReviewData.reviewText = updatedReview.reviewText;
        }

        if (updatedReview.rating) {
            updatedReviewData.rating = updatedReview.rating;
        }
        await reviewCollection.updateOne({_id: id}, {$set: updatedReviewData});
        return await this.getReview(id);
    },

    async removeReview(id) {
        if (!id) throw "id must be given";
        const reviewcollection = await reviews();
        const { ObjectId } = require('mongodb');
        const objRevId = ObjectId.createFromHexString(id);
        const reviewSearch = await reviewcollection.findOne({_id: objRevId});
        const commentList = reviewSearch.comments;
        if (reviewSearch === null){
            throw 'No Review with id - ' + id;
        }
        if (commentList.length != 0) {
            for (var j = 0; j < commentList.length; j++){
                try {
                    const commentCollection = await comments();
                    const { ObjectId } = require('mongodb');
                    const objCommentId = ObjectId.createFromHexString(commentList[j]);
                    const deletionInfoForComment = await commentCollection.removeOne({_id: objCommentId});
                
                    if (deletionInfoForComment.deletedCount === 0) {
                        throw `Could not delete Comment with id of ${commentList[j]}`;
                    }
                } catch (e) {
                    throw 'Could not Delete Comment while deleting Review!';
                }
            }
        }
            try {
                const userCollection = await students();
                const { ObjectId } = require('mongodb');
                const objStudentsId = ObjectId.createFromHexString(reviewSearch.studentId);
                const deletionInfoForReviewFromStudentss = await userCollection.updateOne({ _id: objStudentsId }, { $pull: { reviewIds: String(id) } });
                
                if (deletionInfoForReviewFromStudentss.deletedCount === 0) {
                    throw `Could not delete Review with id of ${id}`;
                }
            } catch (e) {
                throw "Could not Delete Review from Students while Deleting Review!";
            }
            try {
                const resCollection = await courses();
                const { ObjectId } = require('mongodb');
                const objResId = ObjectId.createFromHexString(reviewSearch.courseId);
                const deletionInfoForReviewFromcourse = await resCollection.updateOne({ _id: objResId }, { $pull: { reviews: String(id) } });
                
                if (deletionInfoForReviewFromcourse.deletedCount === 0) {
                    throw `Could not delete Review with id of ${id}`;
                }
            } catch (e) {
                throw `Could not delete Review from course while Deleting Review!`;
            }
            const deletionInfoForReview = await reviewcollection.removeOne({_id: objRevId});
            if (deletionInfoForReview.deletedCount === 0) {
                throw `Could not delete Review with id of ${objRevId}`;
            }
            return true;
        }
    }