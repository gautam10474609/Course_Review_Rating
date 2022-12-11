const { ObjectId } = require('mongodb');
const mongoCollections = require("../config/mongoCollections");

const express = require("express");
const router = express.Router();
const data = require('../data');
const validate = require('../serversideValidate');
const students = data.students;
const courses = data.courses;
const reviews = data.reviews;
const bcrypt = require("bcryptjs");
const xss = require('xss');

router
  .route('/login')
  .get(async (req, res) => {
   let authCookie = req.session.AuthCookie;
   if (authCookie) {
      res.status(200).redirect("/courses");
    } else {
      res.render("login");
    }
  })
  .post(async (req, res) => {
    try {
      let email = validate.validateEmail(req.body.email);
      let password = validate.validatePassword(req.body.password);
      email = email.toLowerCase()
      const studentData = await students.checkStudent(
        email,
        password
      );
      if (studentData.student) {
        let studentId = await students.getStudentsId(email);
        req.session.AuthCookie = studentId;
        req.session.student = studentData.student;
        res.status(200).redirect("/courses");
      } else {
        res.status(400).render("login", { error: "Either the email or password is invalid" });
      }
    } catch (e) {
      res.status(400).render("login", { error: e });
    }
});

  router
  .route('/logout')
  .get(async (req, res) => {
    res.clearCookie("AuthCookie");
    req.session.destroy();
    res.status(200).render("login");
    return;
  })

  router.route('/register')
  .get(async (req, res) => {
    let authCookie = req.session.AuthCookie;
    if (authCookie) {
      res.status(200).redirect("/students/profile");
    } else {
      let e = "Not Authorized"
      res.status(400).render("register", {error:e});
    }
  }).post(async (req, res) => {
    try {
    let firstName = validate.validateFirstName(req.body.firstname);
    let lastName = validate.validateLastName(req.body.lastname);
    let email = validate.validateEmail(req.body.email);
    let password = validate.validatePassword(req.body.password);
    const studentData =  await students.addStudents(xss(firstName), xss(lastName), xss(email),  xss(password));
    if (studentData) res.status(200).redirect("/students/login");
    else {
        res.status(500).render("register", { error: "Internal Server Error" });
        return;
      }
    } catch (e) {
      res.status(400).render("register", { error: e });
      return;
    }       
    
  });

  router.get("/myprofile", async (req, res) => {
    let authCookie = req.session.AuthCookie;
    if (authCookie) {
      const currentStudents = await students.getStudents(authCookie);
        return res.status(307).render('myprofile', {
          id : authCookie,
          firstName: currentStudents.firstName,
          lastName: currentStudents.lastName,
          email: currentStudents.email
        });  
    } else {
      return res.redirect("/students/login");
    }
  });

  router.get("/profile", async (req, res) => {
    let authCookie = req.session.AuthCookie;
    if (authCookie) {
      let studentId = authCookie;
      let studentData = await students.getStudents(studentId);
      let reviewObject = [];
      for (i=0; i<studentData.reviewIds.length; i++) {
        let curReview = await reviews.getReview(studentData.reviewIds[i]);
        let curcourse = await courses.getCourse(curReview.courseId);
        let reviewInfo = {
          review: curReview,
          course: curcourse
        }
        reviewObject.push(reviewInfo);
      }
      return res.status(307).render('profile', { 
        id: studentId,
        firstName: studentData.firstName,
        lastName: studentData.lastName,
        email: studentData.email,
        reviews: reviewObject,
        userLoggedIn: true});
    } else {
      res.status(403).render("login");
    }  
});

router.get("/:id", async (req, res) => {
  let userLoggedIn = false;
  let authCookie = req.session.AuthCookie
  if (authCookie) {
    userLoggedIn = true;
  }
  if (req.params.id === authCookie) {
    return res.redirect("/students/profile");
  }
    try {
      let studentData = await students.getStudents(req.params.id);
      let reviewObject = [];
      for (i=0; i<studentData.reviewIds.length; i++) {
        let curReview = await reviews.getReview(studentData.reviewIds[i]);
        let curcourse = await courses.getCourse(curReview.courseId);
        let reviewInfo = {
          review: curReview,
          course: curcourse
        }
        reviewObject.push(reviewInfo);
      }
      res.status(200).render("student", { 
        id: studentData._id,
        firstName: studentData.firstName, 
        lastName: studentData.lastName, 
        reviews: reviewObject,
        userLoggedIn: userLoggedIn});
    } catch (e) {
      console.log(e);
      res.status(404).json({ message: "Students not found!" });
    }
});
  
router.get("/", async (req, res) => {
    try {
      const studentList = await students.getAllStudents();
      res.status(200).json(studentList);
    } catch (e) {
     res.status(404).send();
    }
});

module.exports = router;