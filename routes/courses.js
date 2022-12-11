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
      const courseList = await courses.getCoursesByOwner(req.session.AuthCookie);
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
    let course = await courses.getCourse(req.params.id);
    res.status(200).render("editcourse", { course: course, userLoggedIn: true })
  }
});

router.get("/:id", async (req, res) => {
    try {
      let course = await courses.getCourse(req.params.id);
      let reviewList = [];
      let studentData = {}
      let userLoggedIn = false;
      let loggedInReviewer = false;
      let sumRating = 0;
      let totalRating = 0;
      let hasError = false;
      let error = [];
      try { // Get reviews of course
        for (let reviewId of course.reviews) {
          let review = await reviews.getReview(reviewId);
          let commentList = [];
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
            for (let commentId of review.comments) {
              let comment = await comments.getComment(commentId);
              comment.student = await students.getStudents(comment.studentId);
              comment.courseId = req.params.id;
              // If this comment is by the logged in user, let them edit it from here
              if (req.session.AuthCookie === comment.studentId) {
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
          if (req.session.AuthCookie === review.studentId) {
            review.isReviewer = true;
            loggedInReviewer = true;
          } else {
            review.isReviewer = false;
            loggedInReviewer = false;
          }
          review.student = await students.getStudents(review.studentId);
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
      course = await courses.getCourse(req.params.id);
      res.status(200).render("course", { course: course, reviews: reviewList, userLoggedIn: userLoggedIn, loggedInReviewer: loggedInReviewer, currentStudentsData: studentData, hasError: hasError, error: error})
    } catch (e) {
      res.status(404).json({ message: "course not found!" });
    }
});
  
router.get("/", async (req, res) => {
  console.log("testA")
  let sumRating = 0;
  let totalRating = 0;

  try {
    let courseList = await courses.getAllcourses();
    for (let couro of courseList){
      let sumRating = 0;
      let totalRating = 0;
      for (let reviewId of couro.reviews) {
        let review = await reviews.getReview(reviewId);
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
    let studentId = req.session.AuthCookie;

    if(!studentId) {
      userLoggedIn = false;
    } else {
      userLoggedIn = true;
    }
    courseList = await courses.getAllcourses();
    let newcourseList = [];
    for (let course of courseList) {
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
    if (!body.courseId) res.status(400).redirect("/courses/admin");
    if (!body.professorname) res.status(400).redirect("/courses/admin");
    if (!body.taname) res.status(400).redirect("/courses/admin");
    if (!body.credits) res.status(400).redirect("/courses/admin");
    if (!body.professoremail) res.status(400).redirect("/courses/admin");
    if (!body.taemail) res.status(400).redirect("/courses/admin");
    try {
      await courses.addcourseWithOwner(body.name, body.courseId, body.professorname, body.taname, body.credits, body.professoremail, body.taemail, req.session.AuthCookie);
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
    if (!body.courseId) res.status(400).redirect("/courses/admin");
    if (!body.professorname) res.status(400).redirect("/courses/admin");
    if (!body.taname) res.status(400).redirect("/courses/admin");
    if (!body.credits) res.status(400).redirect("/courses/admin");
    if (!body.professoremail) res.status(400).redirect("/courses/admin");
    if (!body.taemail) res.status(400).redirect("/courses/admin");
    try {
      await courses.updatecourse(body._id, body.name, body.courseId, body.professorname, body.taname, body.credits, body.professoremail, body.taemail);
    } catch (e) {
      console.log(e);
    }
    res.redirect("/courses/admin");
  }
  
})

router.post("/search", async (req, res) => {
  const body = req.body;
  try {
    let courseList = await courses.getCoursesFromSearch(body.search);
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
    let studentId = req.session.AuthCookie;
    if(!studentId) {
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