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
const multer = require('multer');
const path = require('path');

var fs = require('fs');
// SET STORAGE
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now())
  }
})
 
var upload = multer({ storage: storage })

router.get("/:id", async (req, res) => {
  let isReviewer = false;
    try {
      const review = await reviews.getReview(req.params.id);
      const user = await students.getStudents(review.studentId);
      const course = await courses.getcourse(review.courseId);
      // if the reviewer is on the page, give them a button to edit
      if(req.session.AuthCookie === review.studentId) {
        isReviewer = true;
      }
      res.status(200).render("review", { review: review, user: user, course: course, isReviewer: isReviewer, id: req.params.id });
    } catch (e) {
      res.status(404).json({ message: "review not found!" });
    }
});

router.post("/:id/add", upload.single('picture'), async (req, res) => {
  const data = req.body;
  const rating = data.rating;
  const reviewText = data.reviewText;
  let hasError = false;
  let error = [];
  if (rating > 5 || rating < 1) {
    hasError = true;
    error.push("Rating must be a number between 1 and 5");
    let course = await courses.getcourse(req.params.id);
      let reviewList = [];
      let studentData = {}
      let userLoggedIn = false;
      let loggedInReviewer = false;
      let sumRating = 0;
      let totalRating = 0;

      try { // Get reviews of course
        for (reviewId of course.reviews) {
          review = await reviews.getReview(reviewId);
          commentList = [];
          //Get Avg
          totalRating += 1;
          sumRating += parseInt(review.rating);
        
          //Rating Updates
          let avgRating = sumRating/totalRating;
          avgRating = avgRating.toFixed(2);
          const courCollection = await cour();
          const objIdForRes = ObjectId.createFromHexString(req.params.id);
          const updated = await courCollection.updateOne({_id: objIdForRes}, {$set: { rating: avgRating}})
          if(!updated.matchedCount && !updated.modifiedCount) res.status(500).json({ message: "Couldn't update rating" });

          try { // Get comments of review
            for (commentId of review.comments) {
              comment = await comments.getComment(commentId);
              comment.user = await students.getStudents(comment.studentId);
              commentList.push(comment); // This is a simple FIFO - can be improved or filtered in client JS
            }
          } catch (e) {
            console.log(e);
          }
          review.commentList = commentList; // Add new array inside review object
          // If this review is by the logged in user, let them edit it from here
          if (req.session.AuthCookie === review.studentId) {
            review.isReviewer = true;
            loggedInReviewer = true;
          } else {
            review.isReviewer = false;
            loggedInReviewer = false;
          }
          review.user = await students.getStudents(review.studentId);
          reviewList.push(review); // This is a simple FIFO - can be improved or filtered in client JS

        }
      } catch (e) {
        console.log(e);
      }

      let studentId = req.session.AuthCookie;
      if(!studentId) {
        userLoggedIn = false;
      } else {
        userLoggedIn = true;
        studentData = await students.getStudents(studentId);
        studentData.reviewedcoursePage = reviewList.some(item => item.studentId === String(studentData._id));
      }
    return res.status(403).render("course", { course: course, reviews: reviewList, userLoggedIn: userLoggedIn, loggedInReviewer: loggedInReviewer, currentStudentsData: studentData, hasError: hasError, error: error});
  }
  try {
    const reviewRating = req.body.rating;
    const reviewText = req.body.reviewText;
    var finalImg = ""
    console.log(req.file);
    if(!req.file){
      finalImg = "";
    } else {
      var img = fs.readFileSync(req.file.path);
      var encode_image = img.toString('base64');
      finalImg = {
        contentType: req.file.mimetype,
          image: Buffer.from(encode_image, 'base64')
      };
    }
    
    let studentId = req.session.AuthCookie;
    let courseID = req.params.id;
    const reviewForRes = await reviews.addReview(courseID, studentId, reviewText, Number(reviewRating), finalImg);
    console.log(reviewForRes);
    const redirectURL = "/courses/" + courseID;
    return res.redirect(redirectURL);
  } catch (e) {
    // Something went wrong with the server!
    res.status(404).send();
  }
});

router.get('/reviewPic/:id', async (req, res) => {
  const getReviewData = await reviews.getReview(req.params.id);
  const reviewPicData = getReviewData.reviewPicture;
  if(reviewPicData == ""){
    return res.status(400).send({
      message: 'No Review Pic Found!'
   })
  } else {
    res.contentType('image/jpeg');
    res.send(reviewPicData.image.buffer);
  }
});
  
router.get("/", async (req, res) => {
    try {
      return res.redirect("courses");
    } catch (e) {
      // Something went wrong with the server!
      res.status(404).send();
    }
});

router.get("/:id/edit", async (req, res) => {
  try {
    const review = await reviews.getReview(req.params.id);
    if (req.session.AuthCookie != review.studentId) {
      return res.redirect("/reviews");
    } else {
      res.status(200).render("editReview", {reviewId: req.params.id, reviewText: review.reviewText, rating: review.rating, userLoggedIn: true});
    }} catch (e) {
      res.status(404).json({ message: "review not found" });
    }
});

router.post("/:id/edit", upload.single('picture'), async (req, res) => {
  const data = req.body;
  const rating = data.rating;
  const reviewText = data.reviewText;
  let editedReview = {};
  let hasError = false;
  let error = [];
  
  if (rating > 5 || rating < 1) {
    hasError = true;
    error.push("Rating must be a number between 1 and 5");
    return res.status(403).render("editReview", {reviewId: req.params.id, reviewText: reviewText, rating: rating, hasError: hasError, error: error, userLoggedIn: true});
  }
  try {
    if(!req.file){
      editedReview = {
        rating: rating,
        reviewText: reviewText
      }
    } else {
      var img = fs.readFileSync(req.file.path);
      var encode_image = img.toString('base64');
      var finalImg = {
        contentType: req.file.mimetype,
          image: Buffer.from(encode_image, 'base64')
      };
      editedReview = {
        rating: rating,
        reviewText: reviewText,
        reviewPicture: finalImg
      }
    }
    console.log(editedReview);
    const review = await reviews.getReview(req.params.id);
    const user = await students.getStudents(review.studentId);
    const course = await courses.getcourse(review.courseId);
    const updatedReview = await reviews.updateReview(req.params.id, editedReview);
    if(req.session.AuthCookie === review.studentId) {
      isReviewer = true;
    }
    return res.status(200).render("review", { review: updatedReview, user: user, course: course, isReviewer: isReviewer, id: req.params.id, userLoggedIn: true});
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