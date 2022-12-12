const mongoCollections = require("../config/mongoCollections");
const reviews = mongoCollections.reviews;
const courses = mongoCollections.courses;
const students = mongoCollections.students;
const comments = mongoCollections.comments;
const validate = require('../helper');
const { ObjectId } = require('mongodb');

module.exports = {
    async addReview(courseId, studentId, semesterVal, reviewData, rating) {
        id = validate.validateId(studentId, "studentId");
        id = validate.validateId(courseId, "courseId");
        reviewData = validate.validateString(reviewData, "review Text")
        rating = validate.validateNumber(rating, "rating")
        semesterVal = validate.validateString(semesterVal, "semester")
        if (rating < 1 || rating > 5)  throw "Please choose between 1 and 5";
         
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
        if (isReviewed) throw "Student already reviewed this course";
        
        const insertInfo = await reviewCollection.insertOne(newReviewData);
        if (!insertInfo.acknowledged || !insertInfo.insertedId)throw 'Could not add new Review';
        else {
            const courseInfo = await courseCollection.updateOne({ 
                _id: ObjectId(courseId) 
            }, { 
                $push: { reviews: newReviewData._id.toString() 
                } 
            });
            if (courseInfo.modifiedCount === 0) throw 'Could not update course Collection with Review Data!';
            const studentInfo = await studentsCollection.updateOne({
                 _id: ObjectId(studentId) 
                }, { 
                    $push: { reviewIds: newReviewData._id.toString() 
                    } 
                });
            if (studentInfo.modifiedCount === 0) throw 'Could not update Studentss Collection with Review Data!';
        }
        var newId = String(insertInfo.insertedId);
        const review = await this.getReview(newId);
        return review;
    },

    async getAllReviews() {
        const reviewCollection = await reviews();
        const reviewList = await reviewCollection.find({}).toArray();
        if (!reviewList) throw "No reviews available";
        return reviewList;
    },
    
    async getReview(id) {
        id = validate.validateId(id, "id");
        const reviewCollection = await reviews();
        const review = await reviewCollection.findOne({ 
            _id: ObjectId(id)
        });
        if (!review) throw `No review exists with the ${id}`;
        return review;
    },

    async updateReview(id,  semesterVal, reviewText, rating) {
        id = validate.validateId(id, "review Id");
        reviewText = validate.validateString(reviewText, "reviewText")
        semesterVal = validate.validateString(semesterVal, "semester Val")
        rating = validate.validateNumber(rating, "rating")
        if (rating < 1 || rating > 5)  throw "Please choose between 1 and 5";
        const reviewCollection = await reviews();
        const updatedReview = {};
        updatedReview.semesterVal = semesterVal;
        updatedReview.reviewText = reviewText;
        updatedReview.rating = rating;
        updateReviewData = await reviewCollection.updateOne({
            _id: ObjectId(id)
        }, {
            $set: updatedReview
        });
        if (!updateReviewData.matchedCount && !updateReviewData.modifiedCount) throw "Update of review failed";
        return await this.getReview(ObjectId(id));
    },

    async removeReview(id) {
        id = validate.validateId(id, "review Id");
        const reviewcollection = await reviews();
        const commentCollection = await comments();
        const studentColection = await students();
        const courseCollection = await courses();
        const getRev = await reviewcollection.findOne({_id: ObjectId(id)});
        const listOFComments = getRev.comments;
        if (!getRev) throw `No Review with ${id}`;
        try { 
            const deleteReviewFromCourse = await courseCollection.updateOne({
                 _id: ObjectId(getRev.courseId) 
             }, { 
                 $pull: { reviews: id.toString() 
                 } 
             });
             if (deleteReviewFromCourse.deletedCount === 0) throw `Could not delete Review ${id}`;
         } catch (e) {
             throw `Could not delete review from course`;
         }
        try {
            const deleteRevFromStuInfo = await studentColection.updateOne({
                 _id: ObjectId(getRev.studentId) 
                }, { 
                    $pull: { reviewIds: id.toString() 
                    } 
                });
            if (deleteRevFromStuInfo.deletedCount === 0) throw `Could not delete review ${id}`;
        } catch (e) {
            throw "Could not delete review from students";
        }
        if (listOFComments) {
            for(let i in listOFComments)
                 try {
                     const deleteCommInfo = await commentCollection.deleteOne({
                         _id: ObjectId(i)
                     });
                     if (deleteCommInfo.deletedCount === 0) throw `Could not delete Comment ${i}`;
                 } catch (e){
                     throw 'Could not delete comment from review';
                 }  
         }
        const deleteReviewInfo = await reviewcollection.deleteOne({
            _id: ObjectId(id)
        });
        if (deleteReviewInfo.deletedCount === 0) throw `Could not delete Review  ${ObjectId(id)}`;
            return true;
        }
    }