const studentData = require('./students');
const courseData = require('./courses');
const reviewData = require('./reviews');
const commentData = require('./comments');
module.exports = { 
    courses: courseData,
    students: studentData,
    reviews: reviewData,
    comments: commentData
};