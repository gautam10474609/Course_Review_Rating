const { ObjectId } = require('mongodb');
const mongoCollections = require("../config/mongoCollections");

const express = require("express");
const router = express.Router();
const data = require('../data');
const students = data.students;
const courses = data.courses;
const reviews = data.reviews;
const bcrypt = require("bcryptjs");
const reviewData = mongoCollections.reviews;
const userData = mongoCollections.students;
const xss = require('xss');

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

router.post('/upload/profilepic', upload.single('picture'), async (req, res) => {
  var img = fs.readFileSync(req.file.path);
  var encode_image = img.toString('base64');
  let userId = req.session.AuthCookie;
  var finalImg = {
      contentType: req.file.mimetype,
      image: Buffer.from(encode_image, 'base64')
  };

  const addingProfilePicture = await students.addStudentsProfilePicture(userId, finalImg);
  res.redirect("/students/profile");
});

router.get('/profilepic/:id', async (req, res) => {
  const getStudents = await students.getStudents(req.params.id);
  const profilepicData = getStudents.profilePicture;
  if(profilepicData == ""){
    return res.status(400).send({
      message: 'No Profile Pic Found!'
   })
  } else {
    res.contentType('image/jpeg');
    res.send(profilepicData.image.buffer);
  }
});

router.get("/login", (req, res) => {
  let hasErrors = false;
  let errors = [];
  let userId = req.session.AuthCookie;
  if(!userId) {
    auth = "Not Authorised Students"
    errors.push("Not Authorised, Please Login");
    res.render("login");
  } else {
    auth = "Authorised Students"
    res.redirect("/students/profile");
  }
});

router.get("/logout", (req, res) => {
  req.session.destroy(function(err) {
    console.log("Students logged out!");
  })
  res.status(200).render("login");
})

router.get("/profile", async (req, res) => {
    let hasErrors = true;
    let errors = [];
    if(!req.session.AuthCookie) {
      auth = "Not Authorised Students"
      errors.push("Not Authorised, Please Login");
      res.status(403).render("login", {hasErrors:hasErrors, errors: errors});
    } else {
      auth = "Authorised Students"
      let userId = req.session.AuthCookie;
      let userData = await students.getStudents(userId);
      let reviewObject = [];
      for (i=0; i<userData.reviewIds.length; i++) {
        let curReview = await reviews.getReview(userData.reviewIds[i]);
        let curcourse = await courses.getcourse(curReview.courseId);
        let reviewInfo = {
          review: curReview,
          course: curcourse
        }
        reviewObject.push(reviewInfo);
      }
      return res.status(307).render('profile', { 
        id: userId,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        city: userData.city,
        state: userData.state,
        age: userData.age,
        reviews: reviewObject,
        userLoggedIn: true});
    }
});

router.get("/myprofile", async (req, res) => {
  if (!req.session.AuthCookie) {
      return res.redirect("/students/login");
  } else {
    const currentStudents = await students.getStudents(req.session.AuthCookie);
      return res.status(307).render('myprofile', {
        id : req.session.AuthCookie,
        firstName: currentStudents.firstName,
        lastName: currentStudents.lastName,
        //profilePicture: currentStudents.profilePicture,
        email: currentStudents.email,
        city: currentStudents.city,
        state: currentStudents.state,
        age: currentStudents.age,
        isEditing: false,
        userLoggedIn: true});
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
      let userData = await students.getStudents(req.params.id);
      let reviewObject = [];
      for (i=0; i<userData.reviewIds.length; i++) {
        let curReview = await reviews.getReview(userData.reviewIds[i]);
        let curcourse = await courses.getcourse(curReview.courseId);
        let reviewInfo = {
          review: curReview,
          course: curcourse
        }
        reviewObject.push(reviewInfo);
      }
      res.status(200).render("user", { 
        id: userData._id,
        firstName: userData.firstName, 
        lastName: userData.lastName, 
        profilePicture: userData.profilePicture, 
        state: userData.state,
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
  const city = data.city;
  const state = data.state;
  const age = data.age;
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
      city: city,
      state: state,
      age: age,
      hashedPassword: hashedPassword
    }
  } else {
    editedStudents = {
      firstName: firstName,
      lastName: lastName,
      email: email,
      city: city,
      state: state,
      age: age
    }
  }
  try {
    const updatedStudents = await students.updateStudents(req.session.AuthCookie, editedStudents);
    return res.render('myprofile', { 
      id: req.session.AuthCookie,
      firstName: updatedStudents.firstName,
      lastName: updatedStudents.lastName,
      email: updatedStudents.email,
      city: updatedStudents.city,
      state: updatedStudents.state,
      age: updatedStudents.age,
      userLoggedIn: true})
    } catch(e) {
      res.status(404).json({ message: "Could not update user!" });
    }
  });

  router.post("/login", async (req, res) => {
    let hasErrors = false;
    let errors = [];
    let userId = req.session.AuthCookie;
    if(userId) {
      auth = "Authorised Students"
      return res.redirect("/students/profile");
    } else {
      	const userCollection = await userData();
      	let userName = (req.body.username).toLowerCase();
      	let password = req.body.password;
      
        const user = await userCollection.findOne({ email: userName});
        
      	if(!user) {
          auth = "Not Authorised Students"
          hasErrors = true;
          errors.push("Invalid Studentsname or Password");
          res.status(401);
          return res.render("login", {hasErrors:hasErrors, errors: errors});
        } else {
          let isSame = await bcrypt.compare(password, user.hashedPassword);
          if(!isSame) {
            auth = "Not Authorised Students"
            hasErrors = true;
            errors.push("Invalid Studentsname/Password");
            res.status(401);
            return res.render("login", {hasErrors:hasErrors, errors: errors});
          } else {
            auth = "Authorised Students"
            let userId = await students.getStudentsId(userName);
            req.session.AuthCookie = userId;
            req.session.user = user;
            return res.redirect("/students/profile");
          }
        }
      }
});

router.post("/signup", async (req, res) => {
	let hasErrors = false;
	const saltRounds = 16;
	let errors = [];
  let hashedPassword = ""
	let firstName = req.body.firstname;
	let lastName = req.body.lastname;
	let age = req.body.age;
	let userName = req.body.username;
  let password = req.body.password;
  let city = req.body.city;
  let state = req.body.state;
  
  const userCollection = await userData();      
  const user = await userCollection.findOne({ email: userName});
  if (user) {
    hasErrors = true;
    errors.push("Students with this email already exists");
    res.status(401);
    return res.render("login", {hasErrors:hasErrors, errors: errors});
  }

	if(firstName == "" || !firstName){
		hasErrors = true;
		errors.push("Please Enter your First Name");
		res.status(401);
		return res.render("login", {hasErrors:hasErrors, errors: errors});
	}
	if(lastName == "" || !lastName){
		hasErrors = true;
		errors.push("Please Enter your Last Name");
		res.status(401);
		return res.render("login", {hasErrors:hasErrors, errors: errors});
	}
	if(age == "" || !age){
		hasErrors = true;
		errors.push("Please Enter your age");
		res.status(401);
		return res.render("login", {hasErrors:hasErrors, errors: errors});
	}
	if(userName == "" || !userName){
		hasErrors = true;
		errors.push("Please Enter your Email");
		res.status(401);
		return res.render("login", {hasErrors:hasErrors, errors: errors});
  }
  if(city == "" || !city){
		hasErrors = true;
		errors.push("Please Enter your City Name");
		res.status(401);
		return res.render("login", {hasErrors:hasErrors, errors: errors});
	}
	if(password == "" || !password){
		hasErrors = true;
		errors.push("Please Enter a Password");
		res.status(401);
		return res.render("login", {hasErrors:hasErrors, errors: errors});
	}
	
	bcrypt.genSalt(saltRounds, async function (err, salt) {
		if (err) {
			hasErrors = true;
			errors.push("Error in Parsing the Password, Please Try Again!");
			res.status(401);
			return res.render("login", {hasErrors:hasErrors, errors: err});
			// throw err
		} else {
			bcrypt.hash(password, salt, async function(err, hash) {
				if (err) {
					hasErrors = true;
					errors.push("Error in Parsing the Password, Please Try Again!");
					res.status(401);
					return res.render("login", {hasErrors:hasErrors, errors: err});
					// throw err
				} else {
          hashedPassword = hash;

          try {
            await students.addStudents(xss(firstName), xss(lastName), xss(userName), "", xss(city), xss(state), xss(age), xss(hashedPassword));
          } catch (e) {
            hasErrors = true;
            errors.push("Email ID already exists!");
            res.status(401);
					  return res.render("login", {hasErrors:hasErrors, errors: errors});
          }
          
					errors.push("Signed Up Successfully!");
      		res.status(200).render("login", {hasErrors:true, errors: errors});
				}
		  })
		}
	});
});

module.exports = router;