const express = require("express");
const router = express.Router();
const data = require('../data');
const comments = data.comments;
const courses = data.courses;
const reviews = data.reviews;
const students = data.students;
const mongoCollections = require("../config/mongoCollections");
const cour = mongoCollections.courses;
const { ObjectId } = require('mongodb');
const session = require("express-session");

router.get("/admin", async (req, res) => {
  if (!req.session.AuthCookie) {
    res.status(401).redirect("/students/login");
  } else{ 
    try {
      const courseList = await courses.getcoursesByOwner(req.session.AuthCookie);
      // const userLoggedIn = (req.session.AuthCookie) ? true : false;
      res.status(200).render("admin", { courses: courseList, userLoggedIn: true })
    } catch (e) {
      console.log(e);
      res.status(200).render("admin", { courses: [], userLoggedIn: true })
    }
  }
});

router.get("/edit/:id", async (req, res) => {
  if (!req.session.AuthCookie) {
    res.status(401).redirect("/students/login");
  } else if (!courses.checkcourseOwnership(req.params.id, req.session.AuthCookie)) {
    res.status(401).redirect("/courses/admin");
  } else {
    let course = await courses.getcourse(req.params.id);
    res.status(200).render("editcourse", { course: course, userLoggedIn: true })
  }
});

router.get("/:id", async (req, res) => {
    try {
      let course = await courses.getcourse(req.params.id);
      let reviewList = [];
      let userData = {}
      let userLoggedIn = false;
      let loggedInReviewer = false;
      let sumRating = 0;
      let totalRating = 0;
      let hasError = false;
      let error = [];
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
              comment.user = await students.getStudents(comment.userId);
              comment.courseId = req.params.id;
              // If this comment is by the logged in user, let them edit it from here
              if (req.session.AuthCookie === comment.userId) {
                comment.isCommenter = true;
              } else {
                comment.isCommenter = false;
              }
              commentList.push(comment); // This is a simple FIFO - can be improved or filtered in client JS
            }
          } catch (e) {
            console.log(e);
          }
          review.commentList = commentList; // Add new array inside review object
          // If this review is by the logged in user, let them edit it from here
          if (req.session.AuthCookie === review.userId) {
            review.isReviewer = true;
            loggedInReviewer = true;
          } else {
            review.isReviewer = false;
            loggedInReviewer = false;
          }
          review.user = await students.getStudents(review.userId);
          reviewList.push(review); // This is a simple FIFO - can be improved or filtered in client JS

        }
      } catch (e) {
        console.log(e);
      }

      let userId = req.session.AuthCookie;
      if(!userId) {
        userLoggedIn = false;
      } else {
        userLoggedIn = true;
        userData = await students.getStudents(userId);
        userData.reviewedcoursePage = reviewList.some(item => item.userId === String(userData._id));
      }
      course = await courses.getcourse(req.params.id);
      res.status(200).render("course", { course: course, reviews: reviewList, userLoggedIn: userLoggedIn, loggedInReviewer: loggedInReviewer, currentStudentsData: userData, hasError: hasError, error: error})
    } catch (e) {
      res.status(404).json({ message: "course not found!" });
    }
});
  
router.get("/", async (req, res) => {
  let sumRating = 0;
  let totalRating = 0;

  try {
    let courseList = await courses.getAllcourses();
    for (couro of courseList){
      let sumRating = 0;
      let totalRating = 0;
      for (reviewId of couro.reviews) {
        review = await reviews.getReview(reviewId);
        //Get Avg
        totalRating += 1;
        sumRating += parseInt(review.rating);
      }
      //Rating Updates
      let avgRating = 0;
      if (totalRating !== 0) avgRating = sumRating / totalRating;
      avgRating = avgRating.toFixed(2);
      const courCollection = await cour();
      const updated = await courCollection.updateOne({_id: couro._id}, {$set: { rating: avgRating}});
      if(!updated.matchedCount && !updated.modifiedCount) res.status(500).json({ message: "Couldn't update rating" });
    }
    
    let userLoggedIn = false;
    let userId = req.session.AuthCookie;

    if(!userId) {
      userLoggedIn = false;
    } else {
      userLoggedIn = true;
    }
    courseList = await courses.getAllcourses();
    let newcourseList = [];
    for (course of courseList) {
      if (course.reviews.length > 0) {
        course.rated = true;
      } else {
        course.rated = false;
      }
      newcourseList.push(course);
    }
    res.status(200).render("courses", { courses: newcourseList, userLoggedIn: userLoggedIn});
  } catch (e) {
    // Something went wrong with the server!
    console.log(e);
    res.status(404).send();
  }

    
});

router.post("/add", async (req, res) => {
  if (!req.session.AuthCookie) {
    res.status(401).redirect("/students/login");
  } else {
    const body = req.body;
    if (!body.name) res.status(400).redirect("/courses/admin"); 
    if (!body.website) res.status(400).redirect("/courses/admin");
    if (!body.category) res.status(400).redirect("/courses/admin");
    if (!body.address) res.status(400).redirect("/courses/admin");
    if (!body.city) res.status(400).redirect("/courses/admin");
    if (!body.state) res.status(400).redirect("/courses/admin");
    if (!body.zip) res.status(400).redirect("/courses/admin");
    if (!body.longitude) res.status(400).redirect("/courses/admin");
    if (!body.latitude) res.status(400).redirect("/courses/admin");
    try {
      await courses.addcourseWithOwner(body.name, body.website, body.category, body.address, body.city, body.state, body.zip, parseFloat(body.longitude), parseFloat(body.latitude), req.session.AuthCookie);
    } catch (e) {
      console.log(e);
    }
    res.redirect("/courses/admin");
  }
  
})

router.post("/edit", async (req, res) => {
  const body = req.body;
  if (!req.session.AuthCookie) {
    res.status(401).redirect("/students/login");
  } else if (!body._id) { // Check that course ID didn't get lost somehow
    res.status(400).redirect("/courses/admin")
  } else if (!courses.checkcourseOwnership(body._id, req.session.AuthCookie)) { // Check that user has permission to admin
    res.status(401).redirect("/courses/admin");
  } else {
    if (!body.name) res.status(400).redirect("/courses/admin"); 
    if (!body.website) res.status(400).redirect("/courses/admin");
    if (!body.category) res.status(400).redirect("/courses/admin");
    if (!body.address) res.status(400).redirect("/courses/admin");
    if (!body.city) res.status(400).redirect("/courses/admin");
    if (!body.state) res.status(400).redirect("/courses/admin");
    if (!body.zip) res.status(400).redirect("/courses/admin");
    if (!body.longitude) res.status(400).redirect("/courses/admin");
    if (!body.latitude) res.status(400).redirect("/courses/admin");
    try {
      await courses.updatecourse(body._id, body.name, body.website, body.category, body.address, body.city, body.state, body.zip, parseFloat(body.longitude), parseFloat(body.latitude));
    } catch (e) {
      console.log(e);
    }
    res.redirect("/courses/admin");
  }
  
})

router.post("/search", async (req, res) => {
  const body = req.body;
  try {
    let courseList = await courses.getcoursesViaSearch(body.search);
    let newcourseList = [];
    for (course of courseList) {
      if (course.reviews.length > 0) {
        course.rated = true;
      } else {
        course.rated = false;
      }
      newcourseList.push(course);
    }

    let userLoggedIn = false;
    let userId = req.session.AuthCookie;
    if(!userId) {
      userLoggedIn = false;
    } else {
      userLoggedIn = true;
    }
    
    if (courseList.length > 0) {
      res.status(200).render("courses", { courses: newcourseList , userLoggedIn: userLoggedIn });
    } else {
      res.status(200).render("search", { userLoggedIn: userLoggedIn });
    }
  } catch (e) {
    res.status(500).send();
  }
})

module.exports = router;