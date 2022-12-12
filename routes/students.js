const express = require("express");
const router = express.Router();
const data = require('../data');
const validate = require('../helper');
const students = data.students;
const courses = data.courses;
const reviews = data.reviews;
const xss = require('xss');

router
  .route('/logout')
  .get(async (req, res) => {
    res.clearCookie("AuthCookie");
    req.session.destroy();
    res.status(200).render("login");
    return;
  })
router.get("/", async (req, res) => {
  try {
    const studentList = await students.getAllStudents();
    res.status(200).json(studentList);
  } catch (e) {
   res.status(404).render("error", { 
     error: e
     });
  }
});

router
  .route('/login')
  .get(async (req, res) => {
   let studentId = req.session.AuthCookie;
   if (studentId) {
      res.status(200).redirect("/courses");
    } else {
      res.render("login");
    }
  })
  .post(async (req, res) => {
    let email = req.body.email
    let password = req.body.password;
    try{
      email = await validate.validateEmail(email, "Email");
      email = email.toLowerCase()
    } catch (e) {
      res.status(400).render("error", { 
        error: e 
      });
      return;
    }
    try{
      password = await validate.validatePassword(password);
    } catch (e) {
      res.status(400).render("error", {
         error: e 
        });
      return;
    }
    try {
      const studentData = await students.checkStudent(xss(email),  xss(password));
      if (studentData.student) {
        let studentId = await students.getStudentsId(email);
        req.session.AuthCookie = studentId;
        req.session.student = studentData.student;
        res.status(200).redirect("/courses");
      } else {
        res.status(400).render("login", {
           error: "Either the email or password is invalid" 
          });
      }
    } catch (e) {
      res.status(400).render("login", { 
        error: e 
      });
    }
});


  router.route('/register')
  .get(async (req, res) => {
    let studentId = req.session.AuthCookie;
    if (studentId) {
      res.status(200).redirect("/students/profile");
    } else {
      let e = "Not Authorized"
      res.status(400).render("register", {
        error:e
      });
    }
  }).post(async (req, res) => {
    let firstName = req.body.firstname
    let lastName = req.body.lastname;
    let email = req.body.email
    let password = req.body.password;
    try{
      firstName = await validate.validateName(firstName, "First Name" );
    } catch (e) {
      res.status(400).render("error", { 
        error: e
       });
      return;
    }
    try{
      lastName = await validate.validateName(lastName, "Last Name" );
    } catch (e) {
      res.status(400).render("error", { 
        error: e
       });
      return;
    }
    try{
      email = await validate.validateEmail(email, "Email");
    } catch (e) {
      res.status(400).render("error", { 
        error: e 
      });
      return;
    }
    try{
      password = await validate.validatePassword(password);
    } catch (e) {
      res.status(400).render("error", { 
        error: e
       });
      return;
    }
    try {
    const studentData =  await students.addStudents(xss(firstName), xss(lastName), xss(email),  xss(password));
    if (studentData) res.status(200).redirect("/students/login");
    else {
        res.status(500).render("register", {
           error: "Internal Server Error"
           });
        return;
      }
    } catch (e) {
      res.status(400).render("register", {
         error: e
         });
      return;
    }       
    
  });

  router.get("/myprofile", async (req, res) => {
    let studentId = req.session.AuthCookie;
    if (studentId) {
      const currentStudents = await students.getStudents(studentId);
        return res.status(307).render('myprofile', {
          id : studentId,
          firstName: currentStudents.firstName,
          lastName: currentStudents.lastName,
          email: currentStudents.email
        });  
    } else {
      return res.redirect("/students/login");
    }
  });

  router.get("/profile", async (req, res) => {
    let studentId = req.session.AuthCookie;
    if (studentId) {
      let studentData = await students.getStudents(studentId);
      let reviewObject = [];
      for (i=0; i<studentData.reviewIds.length; i++) {
        let latestReview = await reviews.getReview(studentData.reviewIds[i]);
        let currcourse = await courses.getCourse(latestReview.courseId);
        let reviewInfo = {
          review: latestReview,
          course: currcourse
        }
        reviewObject.push(reviewInfo);
      }
      return res.status(307).render('profile', { 
        id: studentId,
        firstName: studentData.firstName,
        lastName: studentData.lastName,
        email: studentData.email,
        reviews: reviewObject,
        studentLoggedIn: true});
    } else {
      res.status(403).render("login");
    }  
});

router.get("/:id", async (req, res) => {
  let studentLoggedIn = false;
  let studentId = req.session.AuthCookie
  let id = req.params.id;
    try{
      id = await validate.validateId(id, "id");
    } catch (e) {
      res.status(400).render("error", { 
        error: e 
      });
      return;
    }
  if (studentId)
    studentLoggedIn = true;
  if (id === studentId) return res.redirect("/students/profile");
    try {
      let studentData = await students.getStudents(id);
      let reviewObj = [];
      for (i=0; i<studentData.reviewIds.length; i++) {
        let curReview = await reviews.getReview(studentData.reviewIds[i]);
        let curcourse = await courses.getCourse(curReview.courseId);
        let reviewDataInfo = {review: curReview, course: curcourse}
        reviewObj.push(reviewDataInfo);
      }
      res.status(200).render("student", { 
        id: studentData._id,
        firstName: studentData.firstName, 
        lastName: studentData.lastName, 
        reviews: reviewObj,
        studentLoggedIn: studentLoggedIn
      });
    } catch (e) {
      res.status(404).render("error", {
         error: e 
        });
    }
});

module.exports = router;