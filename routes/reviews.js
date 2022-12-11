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
const validate = require('../helper');

router.get("/", async (req, res) => {
    try {
      return res.redirect("courses");
    } catch (e) {
     res.status(404).send();
    }
});

router.get("/:id", async (req, res) => {
  let isStudentReviewer = false;
  let id = req.params.id;
  let studentId = req.session.AuthCookie;
  try{
      id = await validate.validateId(id, "id");
  } catch (e) {
      res.status(400).render("error", { 
        error: e 
      });
      return;
  }
    try {
      const review = await reviews.getReview(id);
      const course = await courses.getCourse(review.courseId);
      const student = await students.getStudents(review.studentId);
      
      if(studentId !== review.studentId) isStudentReviewer = false;
      else isStudentReviewer = true;
      res.status(200).render("review", { 
        review: review, 
        student: student, 
        course: course, 
        isStudentReviewer: isStudentReviewer, 
        id: id 
      });
    } catch (e) {
      res.status(404).render("error", {
         error: e
         });
    }
});

router.post("/:id/add", async (req, res) => {
  let id = req.params.id;
  let rating = Number(req.body.rating);
  let reviewText = req.body.reviewText;
  let studentId = req.session.AuthCookie;
    try{
      id = await validate.validateId(id, "id");
    } catch (e) {
      res.status(400).render("error", {
         error: e 
        });
      return;
    }
    try{
      rating = validate.validateNumber(rating, "rating");
    } catch (e) {
      res.status(400).render("error", { 
        error: e
       });
      return;
    }
    try{
      reviewText = await validate.validateString(reviewText, "reviewText");
    } catch (e) {
      res.status(400).render("error", { 
        error: e 
      });
      return;
    }
  try {
    await reviews.addReview(id, studentId, reviewText, rating);
    return res.redirect("/courses/" + id);
  } catch (e) {
    res.status(404).render("error", { 
      error: e
     });
  }
});

router.route("/:id/edit").get(async (req, res) => {
  let id = req.params.id;
  let rating = Number(req.body.rating);
  let reviewText = req.body.reviewText;
  let studentId = req.session.AuthCookie;
    try{
      id = await validate.validateId(id, "id");
    } catch (e) {
      res.status(400).render("error", {
         error: e 
        });
      return;
    }
    try{
      rating = validate.validateNumber(rating, "rating");
    } catch (e) {
      res.status(400).render("error", {
         error: e
         });
      return;
    }
    try{
      reviewText = await validate.validateString(reviewText, "reviewText");
    } catch (e) {
      res.status(400).render("error", {
         error: e 
        });
      return;
    }
  try {
    const review = await reviews.getReview(id);
    if (studentId != review.studentId) {
      return res.redirect("/reviews");
    } else {
      res.status(200).render("editReview", {
        reviewId: id, 
        reviewText: review.reviewText, 
        rating: review.rating, 
        studentLoggedin: true
      });
    }} catch (e) {
      res.status(404).render("error", { 
        error: e 
      });
    }
}).post(async (req, res) => {
  const id = req.params.id
  const rating = Number(req.body.rating);
  const reviewText = req.body.reviewText;
  let studentId= req.session.AuthCookie
  try{
    id = await validate.validateId(id, "id");
  } catch (e) {
    res.status(400).render("error", { 
      error: e 
    });
    return;
  }
  try{
    rating = validate.validateNumber(rating, "rating");
  } catch (e) {
    res.status(400).render("error", {
       error: e 
      });
    return;
  }
  if (rating > 5 || rating < 1) {
    return res.status(403).render("editReview", {
      reviewId: req.params.id, 
      reviewText: reviewText, 
      rating: rating, 
      studentLoggedin: true, 
      isError: true, 
      error: "Rating must be a number between 1 and 5"});
  }
  try{
    reviewText = await validate.validateString(reviewText, "reviewText");
  } catch (e) {
    res.status(400).render("error", { 
      error: e 
    });
    return;
  }
  
  try {
    const review = await reviews.getReview(req.params.id);
    const student = await students.getStudents(review.studentId);
    const course = await courses.getCourse(review.courseId);
    const updatedReview = await reviews.updateReview(req.params.id, rating, reviewText);
    if(studentId === review.studentId) {
      isStudentReviewer = true;
    }
    return res.status(200).render("review", { 
      review: updatedReview, 
      student: student, 
      course: course, 
      isStudentReviewer: isStudentReviewer, 
      id: req.params.id, 
      studentLoggedin: true
    });
  } catch (e) {
    res.status(404).render("error", { 
      error: e 
    });
  }
});

router.get('/:courseId/:reviewId/delete', async (req, res) => {
  if (!req.params.reviewId) {
    res.status(400).render("error", {
       error: e 
      });
    return;
  }
  try {
    await reviews.getReview(req.params.reviewId);
  } catch (e) {
    res.status(404).render("error", {
       error: e 
      });
    return;
  }
  try {
    deleteReviewWithComments = await reviews.removeReview(req.params.reviewId);
    if(deleteReviewWithComments){
      return res.redirect("/courses/" + req.params.courseId);
    } else {
      return res.status(404).render("error", { 
        error: "not able to delete comments" 
      });
    }
  } catch (e) {
    res.status(500).render("error", { 
      error: e 
    });
  }
});

module.exports = router;