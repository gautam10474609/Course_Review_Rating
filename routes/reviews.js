const express = require("express");
const router = express.Router();
const data = require('../data/');
const reviews = data.reviews;
const students = data.students;
const courses = data.courses;
const comments = data.comments;
const mongoCollections = require("../config/mongoCollections");
const cour = mongoCollections.courses;
const { ObjectId } = require('mongodb');

router.get("/", async (req, res) => {
    try {
      return res.redirect("courses");
    } catch (e) {
     res.status(404).send();
    }
});

router.get("/:id", async (req, res) => {
  let isReviewer = false;
    try {
      const review = await reviews.getReview(req.params.id);
      const student = await students.getStudents(review.studentId);
      const course = await courses.getCourse(review.courseId);
      if(req.session.AuthCookie === review.studentId) {
        isReviewer = true;
      }
      res.status(200).render("review", { review: review, student: student, course: course, isReviewer: isReviewer, id: req.params.id });
    } catch (e) {
      res.status(404).json({ message: "review not found!" });
    }
});

router.post("/:id/add", async (req, res) => {
  const rating = req.body.rating;
  const reviewText = req.body.reviewText;
  let authCookie = req.session.AuthCookie;
  let hasError = false;
  let error = [];
  if (rating < 1 || rating > 5) {
      let course = await courses.getCourse(req.params.id);
      let reviewList = [];
      let studentData = {}
      let studentLoggedin = false;
      let loggedInReviewer = false;
      let sumRating = 0;
      let totalRating = 0;

      try {
        for (let reviewId of course.reviews) {
          review = await reviews.getReview(reviewId);
          console.log(review)
          commentList = [];

          totalRating += 1;
          sumRating += parseInt(review.rating);
        
          let avgRating = sumRating/totalRating;
          avgRating = avgRating.toFixed(2);
          const courCollection = await cour();
          const objIdForRes = ObjectId.createFromHexString(req.params.id);
          const updated = await courCollection.updateOne({_id: objIdForRes}, {$set: { rating: avgRating}})
          if(!updated.matchedCount && !updated.modifiedCount) res.status(500).json({ message: "Couldn't update rating" });

          try { 
            for (commentId of review.comments) {
              comment = await comments.getComment(commentId);
              comment.student = await students.getStudents(comment.studentId);
              commentList.push(comment);
            }
          } catch (e) {
            console.log(e);
          }
          review.commentList = commentList; 
          if (req.session.AuthCookie === review.studentId) {
            review.isReviewer = true;
            loggedInReviewer = true;
          } else {
            review.isReviewer = false;
            loggedInReviewer = false;
          }
          review.student = await students.getStudents(review.studentId);
          reviewList.push(review); 

        }
      } catch (e) {
        console.log(e);
      }

     
      if(authCookie) {
        studentLoggedin = true;
        studentData = await students.getStudents(authCookie);
        studentData.reviewedcoursePage = reviewList.some(item => item.authCookie === String(studentData._id));
      } else {
        studentLoggedin = false;
      }
    return res.status(403).render("course", { course: course, reviews: reviewList, studentLoggedin: studentLoggedin, loggedInReviewer: loggedInReviewer, currentStudentsData: studentData, hasError: hasError, error: error});
  }
  try {
    let courseID = req.params.id;
    const reviewForRes = await reviews.addReview(courseID, authCookie, reviewText, Number(rating));
    const redirectURL = "/courses/" + courseID;
    return res.redirect(redirectURL);
  } catch (e) {
    res.status(404).send();
  }
});

  
router.get("/", async (req, res) => {
    try {
      return res.redirect("courses");
    } catch (e) {
     res.status(404).send();
    }
});

router.get("/:id/edit", async (req, res) => {
  try {
    const review = await reviews.getReview(req.params.id);
    if (req.session.AuthCookie != review.studentId) {
      return res.redirect("/reviews");
    } else {
      res.status(200).render("editReview", {reviewId: req.params.id, reviewText: review.reviewText, rating: review.rating, studentLoggedin: true});
    }} catch (e) {
      res.status(404).json({ message: "review not found" });
    }
});

router.post("/:id/edit",  async (req, res) => {
  const rating = req.body.rating;
  const reviewText = req.body.reviewText;
  let editedReview = {};
  let hasError = false;
  let error = [];
  
  if (rating > 5 || rating < 1) {
    hasError = true;
    error.push("Rating must be a number between 1 and 5");
    return res.status(403).render("editReview", {reviewId: req.params.id, reviewText: reviewText, rating: rating, hasError: hasError, error: error, studentLoggedin: true});
  }
  try {
    if(!req.file){
      editedReview = {
        rating: rating,
        reviewText: reviewText
      }
    } else {
     
      editedReview = {
        rating: rating,
        reviewText: reviewText
      }
    }
    console.log(editedReview);
    const review = await reviews.getReview(req.params.id);
    const student = await students.getStudents(review.studentId);
    const course = await courses.getCourse(review.courseId);
    const updatedReview = await reviews.updateReview(req.params.id, editedReview);
    if(req.session.AuthCookie === review.studentId) {
      isReviewer = true;
    }
    return res.status(200).render("review", { review: updatedReview, student: student, course: course, isReviewer: isReviewer, id: req.params.id, studentLoggedin: true});
  } catch (e) {
    console.log(e);
    res.status(404).json ({message: "could not update review"});
  }
});

router.get('/:courseId/:reviewId/delete', async (req, res) => {
  if (!req.params.reviewId) {
    res.status(400).json({ error: 'You must Supply an ID to delete' });
    return;
  }
  try {
    await reviews.getReview(req.params.reviewId);
  } catch (e) {
    res.status(404).json({ error: 'Review not found!' });
    return;
  }
  try {
    deleteReviewWithComments = await reviews.removeReview(req.params.reviewId);
    if(deleteReviewWithComments){
      return res.redirect("/courses/" + req.params.courseId);
    } else {
      return res.status(404).send();
    }
    //res.json({deleted: true, data: toBeDeletedReview});
  } catch (e) {
    res.status(500).json({ error: e });
  }
});

module.exports = router;

