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
const studentData = mongoCollections.students;
const xss = require('xss');
const path = require('path');
var fs = require('fs');

router
  .route('/login')
  .get(async (req, res) => {
   let authCookie = req.session.AuthCookie;
   if (authCookie) {
      res.status(200).redirect("/students/profile");
    } else {
      res.status(400).render("login");
    }
  })
  .post(async (req, res) => {
    try {
      console.log("12")
      let email = validate.validateEmail(req.body.email);
      let password = validate.validatePassword(req.body.password);
      console.log("123", req.body.email)
      email = email.toLowerCase()
      const studentData = await students.checkStudent(
        email,
        password
      );
      if (studentData.student) {
        let studentId = await students.getStudentsId(email);
        req.session.AuthCookie = studentId;
        req.session.user = studentData.student;
        res.status(200).redirect("/students/profile");
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
    if (req.session.username && authCookie) {
      res.redirect("/students/profile");
    } else {
      let e = "Not Authorized"
      res.render("register", {error:e});
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

  router.get("/profile", async (req, res) => {
    let authCookie = req.session.AuthCookie;
    if (authCookie) {
      let studentId = req.session.AuthCookie;
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

router.get("/myprofile", async (req, res) => {
  let authCookie = req.session.AuthCookie;
  if (authCookie) {
    const currentStudents = await students.getStudents(req.session.AuthCookie);
      return res.status(307).render('myprofile', {
        id : req.session.AuthCookie,
        firstName: currentStudents.firstName,
        lastName: currentStudents.lastName,
        email: currentStudents.email,
        isEditing: false,
        userLoggedIn: true});  
  } else {
    return res.redirect("/students/login");
  }
});

router.get("/:id", async (req, res) => {
  let userLoggedIn = false;
  if (req.session.AuthCookie) {
    userLoggedIn = true;
  }
  if (req.params.id === req.session.AuthCookie) {
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
      res.status(200).render("user", { 
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
      const userList = await students.getAllStudentss();
      res.status(200).json(userList);
    } catch (e) {
      // Something went wrong with the server!
      res.status(404).send();
    }
});

router.post("/myprofile", async (req, res) => {
  let hasErrors = false;
  let errors = [];
  let editedStudents;
  let hashedPassword;
  const data = req.body;
  const firstName = data.firstName;
  const lastName = data.lastName;
  //const profilePicture = data.profilePicture;
  const email = data.email;
   const password = data.password;
  const confirm = data.confirm;

  if (password != confirm) {
    hasErrors = true;
    errors.push("Passwords must match");
    return res.render("myprofile", {hasErrors: hasErrors, errors: errors});
  }
  if (password) {
    hashedPassword = bcrypt.hashSync(password, 10);
    editedStudents = {
      firstName: firstName,
      lastName: lastName,
      //profilePicture: profilePicture,
      email: email,
      hashedPassword: hashedPassword
    }
  } else {
    editedStudents = {
      firstName: firstName,
      lastName: lastName,
      email: email
    }
  }
  try {
    const updatedStudents = await students.updateStudents(req.session.AuthCookie, editedStudents);
    return res.render('myprofile', { 
      id: req.session.AuthCookie,
      firstName: updatedStudents.firstName,
      lastName: updatedStudents.lastName,
      email: updatedStudents.email,
      userLoggedIn: true})
    } catch(e) {
      res.status(404).json({ message: "Could not update user!" });
    }
  });

module.exports = router;