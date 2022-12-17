const comments = require("./comments");
const courses = require("./courses");
const reviews = require("./reviews");
const students = require("./students");
const adminCookieString = "AdminCookie"
const constructorMethod = app => {
  app.use("/comments", comments);
  app.use("/courses", courses);
  app.use("/reviews", reviews);
  app.use("/students", students);
  
  app.get("/", (req, res) => {
    let studentLoggedIn = false, adminLoggedIn=false;
    let studentId ="";
    if (req.session.AuthCookie === adminCookieString) {
      studentLoggedIn = false;
      adminLoggedIn = true;
    }else{
      studentId= req.session.AuthCookie
    }
    if(studentId){
      studentLoggedIn= true
  }
    res.status(200).render("index", {studentLoggedIn: studentLoggedIn, adminLoggedIn: adminLoggedIn});
  });

  app.use('*', (req, res) => {
    res.status(404).render("error",{
      error: 'Not found'
    });
  }); 
};

module.exports = constructorMethod;