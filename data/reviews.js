const mongoCollections = require("../config/mongoCollections");
const reviews = mongoCollections.reviews;
const courses = mongoCollections.courses;
const students = mongoCollections.students;
const comments = mongoCollections.comments;
const validate = require('../helper');
const { ObjectId } = require('mongodb');

module.exports = {
    async createReview(courseId, studentId, semesterVal, rating, reviewData) {
        id = validate.validateId("createReview", studentId, "studentId");
        id = validate.validateId("createReview", courseId, "courseId");
        reviewData = validate.validateString("createReview", reviewData, "review Data")
        rating = validate.validateNumber("createReview", rating, "rating")
        semesterVal = validate.validateString("createReview", semesterVal, "semester")
        if (rating < 1 || rating > 5)  throw "createReview: Please choose between 1 and 5";
         
        const courseCollection = await courses();
        const reviewCollection = await reviews();
        const studentsCollection = await students();
        
        let newReviewData = {
            courseId: courseId,
            studentId: studentId,
            semesterVal: semesterVal,
            reviewData: reviewData,
            rating: rating,
            comments: []
        }
        const isReviewed = await reviewCollection.findOne({ 
            $and: [{
                courseId: courseId
            }, {
                studentId: studentId
            }]
        });
        if (isReviewed) throw "createReview: Student already reviewed this course";
        
        const insertInfo = await reviewCollection.insertOne(newReviewData);
        if (!insertInfo.acknowledged || !insertInfo.insertedId)throw 'createReview: Could not add new Review';
        else {
            const courseInfo = await courseCollection.updateOne({ 
                _id: ObjectId(courseId) 
            }, { 
                $push: { reviews: newReviewData._id.toString() 
                } 
            });
            if (courseInfo.modifiedCount === 0) throw 'createReview: Could not update course Collection with Review Data!';
            const studentInfo = await studentsCollection.updateOne({
                 _id: ObjectId(studentId) 
                }, { 
                    $push: { reviewIds: newReviewData._id.toString() 
                    } 
                });
            if (studentInfo.modifiedCount === 0) throw 'createReview: Could not update Studentss Collection with Review Data!';
        }
        var newId = String(insertInfo.insertedId);
        const review = await this.getReview(newId);
        return review;
    },

    async getAllReviews() {
        const reviewCollection = await reviews();
        const reviewList = await reviewCollection.find({}).toArray();
        if (!reviewList) throw "getAllReviews: No reviews available";
        return reviewList;
    },
    
    async getReview(id) {
        id = validate.validateId("getReview", id, "id");
        const reviewCollection = await reviews();
        const review = await reviewCollection.findOne({ 
            _id: ObjectId(id)
        });
        if (!review) throw `getReview: No review exists with the ${id}`;
        return review;
    },

    async updateReview(id,  semesterVal, rating, reviewData) {
        id = validate.validateId("updateReview", id, "review Id");
        reviewData = validate.validateString("updateReview", reviewData, "reviewData")
        semesterVal = validate.validateString("updateReview", semesterVal, "semester Val")
        rating = validate.validateNumber("updateReview", rating, "rating")
        if (rating < 1 || rating > 5)  throw "updateReview: Please choose between 1 and 5";
        const reviewCollection = await reviews();
        const updatedReview = {};
        updatedReview.semesterVal = semesterVal;
        updatedReview.reviewData = reviewData;
        updatedReview.rating = rating;
        updateReviewData = await reviewCollection.updateOne({
            _id: ObjectId(id)
        }, {
            $set: updatedReview
        });
        if (!updateReviewData.matchedCount && !updateReviewData.modifiedCount) throw "updateReview: Update of review failed";
        return await this.getReview(id);
    },

    async removeReview(id) {
        id = validate.validateId("removeReview", id, "review Id");
        const reviewcollection = await reviews();
        const commentCollection = await comments();
        const studentColection = await students();
        const courseCollection = await courses();
        const getRev = await reviewcollection.findOne({_id: ObjectId(id)});
        const listOFComments = getRev.comments;
        if (!getRev) throw `removeReview: No Review with ${id}`;
        try { 
            const deleteReviewFromCourse = await courseCollection.updateOne({
                 _id: ObjectId(getRev.courseId) 
             }, { 
                 $pull: { reviews: id.toString() 
                 } 
             });
             if (deleteReviewFromCourse.deletedCount === 0) throw `removeReview: Could not delete Review ${id}`;
         } catch (e) {
             throw `removeReview: Could not delete review from course`;
         }
        try {
            const deleteRevFromStuInfo = await studentColection.updateOne({
                 _id: ObjectId(getRev.studentId) 
                }, { 
                    $pull: { reviewIds: id.toString() 
                    } 
                });
            if (deleteRevFromStuInfo.deletedCount === 0) throw `removeReview: Could not delete review ${id}`;
        } catch (e) {
            throw "removeReview: Could not delete review from students";
        }
        if (listOFComments) {
            for(let i in listOFComments)
                 try {
                     const deleteCommInfo = await commentCollection.deleteOne({
                         _id: ObjectId(i)
                     });
                     if (deleteCommInfo.deletedCount === 0) throw `removeReview:Could not delete Comment ${i}`;
                 } catch (e){
                     throw 'removeReview: Could not delete comment from review';
                 }  
         }
        const deleteReviewInfo = await reviewcollection.deleteOne({
            _id: ObjectId(id)
        });
        if (deleteReviewInfo.deletedCount === 0) throw `removeReview: Could not delete Review  ${ObjectId(id)}`;
            return true;
        }
    }