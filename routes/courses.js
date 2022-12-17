const mongoCollections = require("../config/mongoCollections");
const data = require('../data');
const courses = data.courses;
const students = data.students;
const reviews = data.reviews;
const comments = data.comments;
const express = require("express");
const router = express.Router();
const cours = mongoCollections.courses;
const rev = mongoCollections.reviews;
const { ObjectId } = require('mongodb');
const validate = require('../helper');
const xss = require('xss');
const adminCookieString = "AdminCookie"


router.get("/contactus", async (req, res) => {
  let studentLoggedIn = false, adminLoggedIn =false;
  let studentId = "";
  if (req.session.AuthCookie === adminCookieString) {
    studentLoggedIn = false;
    adminLoggedIn = true;
  }else{
    studentId= req.session.AuthCookie
  }
  if (!studentId) studentLoggedIn = false;
  else studentLoggedIn = true;
  try {
   res.status(200).render("contactUs")
  } catch (error) {
    returnres.status(404).render("error",{error: error});
  }
});
router.get("/", async (req, res) => {
  let studentLoggedIn = false;
  let studentId = "";
  let adminLoggedIn =false;
  if (req.session.AuthCookie === adminCookieString) {
    studentLoggedIn = false;
    adminLoggedIn = true;
  }else{
    studentId= req.session.AuthCookie
  }
  if (!studentId) studentLoggedIn = false;
  else studentLoggedIn = true;
  try {
    let courseList = await courses.getAllcourses();
    let getcourseList = [];
    const coursCollection = await cours();
    const reviewCollection = await rev();
    for (let c of courseList) {
      const aggRating = reviewCollection.aggregate([{ $group: { _id: "$courseId", rating: { $avg: "$rating" } } }])
      for await (const doc of aggRating) {
        const updated = await coursCollection.updateOne({ _id: c._id }, { $set: { rating: (doc.rating).toFixed(2) } });
        if (!updated.matchedCount && !updated.modifiedCount) res.status(500).json({ error: "Could not update rating" });
      }
    }
    for (let c of courseList) {
      if (c.reviews.length > 0) {
        c.isRated = true;
      } else {
        c.isRated = false;
      }
      getcourseList.push(c);
    }
    res.status(200).render("courses", 
    { 
      courses: getcourseList, 
      studentLoggedIn: studentLoggedIn, 
      adminLoggedIn: adminLoggedIn 
    });
  } catch (error) {
    return res.status(404).render("error",{error: error});
  }
});

router.route("/:id/edit")
  .get(async (req, res) => {
    let id = req.params.id;
    try {
      id = await validate.validateId("Get Edit", id, "id");
    } catch (error) {
      return res.status(400).json({
        error: error
      });
    }
    let adminLoggedIn = false;
    if (req.session.AuthCookie) {
      adminLoggedIn = true;
      let course = await courses.getCourse(req.params.id)
      res.render("editCourse", {
        course: course,
        adminLoggedIn: adminLoggedIn
      });
    } else {
      res.status(401).redirect("/courses/admin");
    }
  }).post(async (req, res) => {
    if (!req.session.AuthCookie) res.status(401).redirect("/courses/admin");
    else {
      let id = req.params.id;
      let name = req.body.name;
      let courseId = req.body.courseId;
      let credits = Number(req.body.credits);
      let professorName = req.body.professorName;
      let professorEmail = req.body.professorEmail;
      let taName = req.body.taName;
      let taEmail = req.body.taEmail;
      try {
        id = await validate.validateId("Post Edit", id, "id");
      } catch (error) {
        return res.status(400).render("error",{error: error});
      }
      try {
        name = await validate.validateString("Post Edit", name, "name");
      } catch (error) {
        return res.status(400).render("error",{error: error});
      }
      try {
        courseId = await validate.validateString("Post Edit", courseId, "courseId");
      } catch (error) {
        return res.status(400).render("error",{error: error});
      }
      try {
        professorName = await validate.validateString("Post Edit", professorName, "Professor Name");
      } catch (error) {
        return res.status(400).render("error",{error: error});
      }
      try {
        credits = await validate.validateNumber("Post Edit", credits, "credits");
      } catch (error) {
        return res.status(400).render("error",{error: error});
      }
      try {
        taName = await validate.validateString("Post Edit", taName, "TA Name");
      } catch (error) {
        return res.status(400).render("error",{error: error});
      }
      try {
        professorEmail = await validate.validateEmail("Post Edit", professorEmail, "Professor Email");
      } catch (error) {
        return res.status(400).render("error",{error: error});
      }
      try {
        taEmail = await validate.validateEmail("Post Edit", taEmail, "TA Email");
      } catch (error) {
        return res.status(400).render("error",{error: error});
      }
      try {
        await courses.updateCourse(id, name, courseId, credits, professorName, professorEmail, taName, taEmail);
      } catch (error) {
        return res.status(400).render("error",{error: error});
      }
      res.redirect("/courses");
    }
  })
router.route('/admin')
  .get(async (req, res) => {
    res.render("admin");
  }).post(async (req, res) => {
    let email = req.body.email
    let password = req.body.password;
    try {
      email = await validate.validateEmail("Get Admin", email, "Email");
      email = email.toLowerCase()
    } catch (error) {
      return res.status(400).render("error",{error: error});
    }
    try {
      password = await validate.validatePassword("Get Admin", password);
    } catch (error) {
      return res.status(400).render("error",{error: error});
    }
    try {
      const adminData = await courses.checkAdmin(xss(email), xss(password));
      if (adminData.checkedAdmin) {
        req.session.AuthCookie = adminCookieString;
        res.redirect("/courses/add");
      } else {
        return res.status(400).render("error",{error: "Either the email or password is invalid"});
      }
    } catch (error) {
      return res.status(400).json({
        error: error
      });
    }
  })

router
  .route("/add")
  .get(async (req, res) => {
    let adminLoggedIn = false;
    if (req.session.AuthCookie) {
      adminLoggedIn = true;
      res.render("addCourse", {
        adminLoggedIn: adminLoggedIn
      });
    } else {
      res.status(401).redirect("/courses/admin");
    }
  }).post(async (req, res) => {
    if (!req.session.AuthCookie) {
      res.status(401).redirect("/courses/admin");
    } else {
      let name = req.body.name;
      let courseId = req.body.courseId;
      let credits = Number(req.body.credits);
      let professorName = req.body.professorName;
      let professorEmail = req.body.professorEmail;
      let taName = req.body.taName;
      let taEmail = req.body.taEmail;
      try {
        name = await validate.validateString("Post Add", name, "Name");
      } catch (error) {
        return res.status(400).render("error",{
          error: error
        });
      }
      try {
        courseId = await validate.validateString("Post Add", courseId, "Course id");
      } catch (error) {
        return res.status(400).render("error",{
          error: error
        });
      }
      try {
        professorName = await validate.validateString("Post Add", professorName, "Professor Name");
      } catch (error) {
        return res.status(400).render("error",{
          error: error
        });
      }
      try {
        credits = await validate.validateNumber("Post Add", credits, "credits");
      } catch (error) {
        return res.status(400).render("error",{
          error: error
        });
      }
      try {
        taName = await validate.validateString("Post Add", taName, "TA Name");
      } catch (error) {
        return res.status(400).render("error",{
          error: error
        });
      }
      try {
        professorEmail = await validate.validateEmail("Post Add", professorEmail, "Professor Email");
      } catch (error) {
        return res.status(400).render("error",{
          error: error
        });
      }
      try {
        taEmail = await validate.validateEmail("Post Add", taEmail, "TA Email");
      } catch (error) {
        return res.status(400).render("error",{
          error: error
        });
      }
      try {
        await courses.createCourse(name, courseId, credits, professorName, professorEmail, taName, taEmail);
        res.redirect("/courses");
      } catch (error) {
        return res.status(400).render("error",{
          error: error
        });
      }
    }
  })

router.get("/:id", async (req, res) => {
  let id = req.params.id;
  let studentId = "";
  let studentLoggedIn = false, studentReviewLoggedIn = false, adminLoggedIn = false;
  try {
    id = await validate.validateId("Get id", id, "id");
  } catch (error) {
    return res.status(400).render("error",{
      error: error
    });
  }
  try {
    let course = await courses.getCourse(id);
    let reviewCollection = await rev()
    let listOfReviews = []
    let semsterValu = []
    let studentData = {}
    const aggRating = reviewCollection.aggregate([{ $group: { _id: "$courseId", rating: { $avg: "$rating" } } }])
    for await (const doc of aggRating) {
      const coursCollection = await cours();
      const updated = await coursCollection.updateOne({ _id: ObjectId(id) }, { $set: { rating: doc.rating } })
      if (!updated.matchedCount && !updated.modifiedCount) res.status(500).json({ error: "Could not update rating" });
    }
    const semRating = reviewCollection.aggregate([
      {
        $group:
        {
          _id: {
            courseId: "$courseId",
            semsterval: "$semesterVal"
          },
          totalReview: { $sum: 1 },
          avgRating: { $avg: "$rating" }
        }
      }
    ])
    for await (const d of semRating) {
      if (d._id.courseId === id) {
        var result = validate.semsterValue(d._id.semsterval);
        semsterValu.push({
          val: result,
          semrat: (d.avgRating).toFixed(2)
        })
      }
    }
    try {
      for (let r of course.reviews) {
        let listOfComments = [];
        let review = await reviews.getReview(r);
        try {
          for (let c of review.comments) {
            let commentData = await comments.getComment(c);
            commentData.courseId = id;
            commentData.student = await students.getStudents(commentData.studentId);
            if (studentId !== commentData.studentId) commentData.isComment = false;
            else commentData.isComment = true;
            listOfComments.push(commentData);
          }
        } catch (error) {
          return res.status(400).render("error",{
            error: error
          });
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
    } catch (error) {
      return res.status(400).render("error",{
        error: error
      });
    }
    
  if (req.session.AuthCookie === adminCookieString) {
    studentLoggedIn = false;
    adminLoggedIn = true;
  }else{
    studentId= req.session.AuthCookie
  }
  if (!studentId) studentLoggedIn = false;
    else {
      studentLoggedIn = true;
      studentData = await students.getStudents(studentId);
      studentData.reviewedcoursePage = listOfReviews.some(rev => rev.studentId === studentData._id.toString());
    }
    course = await courses.getCourse(id);
    return res.status(200).render("course", {
      course: course,
      semsVal: semsterValu,
      reviews: listOfReviews,
      currentStudentsData: studentData,
      studentLoggedIn: studentLoggedIn,
      studentReviewLoggedIn: studentReviewLoggedIn,
      adminLoggedIn: adminLoggedIn
    })
  } catch (error) {
    return res.status(404).render("error",{
      error: error
    });
  }
 
});

module.exports = router;