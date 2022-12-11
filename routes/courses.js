const mongoCollections = require("../config/mongoCollections");
const data = require('../data');
const courses = data.courses;
const students = data.students;
const reviews = data.reviews;
const comments = data.comments;
const express = require("express");
const router = express.Router();
const cours = mongoCollections.courses;
const { ObjectId } = require('mongodb');
const validate = require('../helper');
const xss = require('xss');
const adminCookieString = "AdminCookie"

router.route('/admin')
  .get(async (req, res) => {
    res.render("admin");
  }).post(async (req, res) => {
    let email = req.body.email
    let password = req.body.password;
    try {
      email = await validate.validateEmail(email, "Email");
      email = email.toLowerCase()
    } catch (e) {
      res.status(400).render("error", {
        error: e
      });
      return;
    }
    try {
      password = await validate.validatePassword(password);
    } catch (e) {
      res.status(400).render("error", {
        error: e
      });
      return;
    }
    try {
      const adminData = await courses.checkAdmin(xss(email), xss(password));
      if (adminData.insertedAdmin) {
        req.session.AuthCookie = adminCookieString;
        res.status(200).render("addCourse");
      } else {
        res.status(400).render("admin", {
          error: "Either the email or password is invalid"
        });
      }
    } catch (e) {
      res.status(400).render("admin", {
        error: e
      });
    }

  })

router.get("/", async (req, res) => {
  let studentLoggedIn = false;
  let studentId = req.session.AuthCookie;
  if (!studentId) studentLoggedIn = false;
  else studentLoggedIn = true;

  let sumofRating = 0;
  let totalofRating = 0;
  let averageRating = 0;

  try {
    let courseList = await courses.getAllcourses();
    let getcourseList = [];
    const coursCollection = await cours();
    for (let c of courseList) {
      for (let revId of c.reviews) {
        let review = await reviews.getReview(revId);
        totalofRating = totalofRating + 1;
        review.rating = parseInt(review.rating)
        sumofRating = sumofRating + review.rating;
      }
      if (totalofRating !== 0) averageRating = (sumofRating / totalofRating).toFixed(2);
      const updated = await coursCollection.updateOne({ _id: c._id }, { $set: { rating: averageRating } });
      if (!updated.matchedCount && !updated.modifiedCount) res.status(500).json({ message: "Could not update rating" });
    }
    for (let c of courseList) {
      if (c.reviews.length > 0) {
        c.rated = true;
      } else {
        c.rated = false;
      }
      getcourseList.push(c);
    }
    res.status(200).render("courses", { courses: getcourseList, studentLoggedIn: studentLoggedIn });
  } catch (e) {
    res.status(404).send();
  }
});

router.post("/search", async (req, res) => {
  let searchText = req.body.search;
  let studentId = req.session.AuthCookie;
  try {
    searchText = await validate.validateString(searchText, "search word");
  } catch (e) {
    res.status(400).render("error", { error: e });
    return;
  }
  let studentLoggedIn = false;
  if (!studentId) studentLoggedIn = false;
  else studentLoggedIn = true;
  let searchcourseList = [];
  try {
    let courseList = await courses.getCoursesFromSearch(searchText);
    for (let c of courseList) {
      if (c.reviews.length > 0) c.rated = true;
      else c.rated = false;
      searchcourseList.push(c);
    }
    if (!courseList) res.status(200).render("search", {
      studentLoggedIn: studentLoggedIn
    });
    else res.status(200).render("courses", {
      courses: searchcourseList,
      studentLoggedIn: studentLoggedIn
    });
  } catch (e) {
    res.status(500).render("error", { error: e });
  }
})

router.get("/:id", async (req, res) => {
  let id = req.params.id;
  let studentId = req.session.AuthCookie;
  try {
    id = await validate.validateId(id, "id");
  } catch (e) {
    res.status(400).render("error", {
      error: e
    });
    return;
  }
  try {
    let course = await courses.getCourse(id);
    let studentLoggedIn = false, studentReviewLoggedIn = false;
    let totalofRating = 0, sumofRating = 0;
    let listOfReviews = []
    let studentData = {}

    try {
      for (let r of course.reviews) {
        let listOfComments = [];
        let review = await reviews.getReview(r);
        totalofRating = totalofRating + 1;
        review.rating = parseInt(review.rating)
        sumofRating = sumofRating + review.rating;

        let averageRating = (sumofRating / totalofRating).toFixed(2);
        const coursCollection = await cours();
        const updated = await coursCollection.updateOne({ _id: ObjectId.createFromHexString(id) }, { $set: { rating: averageRating } })
        if (!updated.matchedCount && !updated.modifiedCount) res.status(500).json({ message: "Could not update rating" });
        try {
          for (let c of review.comments) {
            let commentData = await comments.getComment(c);
            commentData.courseId = id;
            commentData.student = await students.getStudents(commentData.studentId);
            if (studentId !== commentData.studentId) commentData.isComment = false;
            else commentData.isComment = true;
            listOfComments.push(commentData);
          }
        } catch (e) {
          console.log(e);
        }
        review.commentList = listOfComments;
        if (studentId !== review.studentId) {
          review.isStudentReviewer = true;
          studentReviewLoggedIn = true;
        } else {
          review.isStudentReviewer = false;
          studentReviewLoggedIn = false;
        }
        review.student = await students.getStudents(review.studentId);
        listOfReviews.push(review);
      }
    } catch (e) {
      console.log(e);
    }
    if (!studentId) studentLoggedIn = false;
    if (studentId === adminCookieString) studentLoggedIn = false;
    else {
      studentLoggedIn = true;
      studentData = await students.getStudents(studentId);
      studentData.reviewedcoursePage = listOfReviews.some(rev => rev.studentId === studentData._id.toString());
    }
    course = await courses.getCourse(id);
    res.status(200).render("course", {
      course: course,
      reviews: listOfReviews,
      currentStudentsData: studentData,
      studentLoggedIn: studentLoggedIn,
      studentReviewLoggedIn: studentReviewLoggedIn
    })
  } catch (e) {
    res.status(404).render("error", { error: e });
  }
});


router
  .route("/add")
  .get(async (req, res) => {
    res.render("addCourse");
  }).post(async (req, res) => {
    if (!req.session.AuthCookie) {
      res.status(401).redirect("/courses/admin");
    } else {
      const body = req.body;
      if (!body.name) res.status(400).redirect("/courses/admin");
      if (!body.courseid) res.status(400).redirect("/courses/admin");
      if (!body.professorname) res.status(400).redirect("/courses/admin");
      if (!body.taname) res.status(400).redirect("/courses/admin");
      if (!body.credits) res.status(400).redirect("/courses/admin");
      if (!body.professoremail) res.status(400).redirect("/courses/admin");
      if (!body.taemail) res.status(400).redirect("/courses/admin");
      try {
        await courses.addCourseByAdmin(body.name, body.courseid, body.professorname, body.taname, body.credits, body.professoremail, body.taemail, req.session.AuthCookie);
        res.redirect("/courses");
      } catch (e) {
        console.log(e);
      }
    }
  })

router.post("/edit", async (req, res) => {
  const body = req.body;
  if (!req.session.AuthCookie) {
    res.status(401).redirect("/students/login");
  } else if (!body._id) {
    res.status(400).redirect("/courses/admin")
  } else if (!courses.checkcourseOwnership(body._id, req.session.AuthCookie)) {
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
      await courses.updateCourse(body._id, body.name, body.courseId, body.professorname, body.taname, body.credits, body.professoremail, body.taemail);
    } catch (e) {
      console.log(e);
    }
    res.redirect("/courses/admin");
  }
})

module.exports = router;