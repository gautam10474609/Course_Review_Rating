const { ObjectId } = require('mongodb');

const mongoCollections = require("../config/mongoCollections");
const reviews = mongoCollections.reviews;
const courses = mongoCollections.courses;
const students = mongoCollections.students;
const comments = mongoCollections.comments;
const commentFunctions = require("./comments")
// const uuid = require('uuid/v4');

module.exports = {
    async addReview(courseId, studentId, reviewText, rating) {
        if (!courseId || (typeof courseId != "string")) throw "course ID must be given as a string";
        if (!studentId || (typeof studentId != "string")) throw "user ID must be given as a string";
        if (!reviewText || (typeof reviewText != "string")) throw "review text must be given as a string";
        if (!rating || (typeof rating != "number") || (rating < 1) || (rating > 5)) throw "rating must be given as a number from 1 to 5";
         
        
        const reviewCollection = await reviews();
        let newReview = {
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
        const insertInfo = await reviewCollection.insertOne(newReview);
        // if (insertInfo.insertedCount === 0) throw "could not add review";
        
        const resCollection = await courses();
        const studentsCollection = await students();
        const objIdForRes = ObjectId.createFromHexString(courseId);
        const objIdForStudents = ObjectId.createFromHexString(studentId);

        // const insertInfo = await commentCollection.insertOne(newAlbum);
        
        if (insertInfo.insertedCount === 0) {
            throw 'Could not add new Review';
        } else {
            //Add the review id to the course
            const updatedInfo = await resCollection.updateOne({ _id: objIdForRes }, { $push: { reviews: String(newReview._id) } });
            if (updatedInfo.modifiedCount === 0) {
                throw 'Could not update course Collection with Review Data!';
            }
            //Add the review id to the user
            const updatedInfo2 = await studentsCollection.updateOne({ _id: objIdForStudents }, { $push: { reviewIds: String(newReview._id) } });
            if (updatedInfo2.modifiedCount === 0) {
                throw 'Could not update Studentss Collection with Review Data!';
            }
        }

        const newId = insertInfo.insertedId;
        const newIDString = String(newId);
        const review = await this.getReview(newIDString);
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