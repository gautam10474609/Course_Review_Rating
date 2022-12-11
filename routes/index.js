const comments = require("./comments");
const courses = require("./courses");
const reviews = require("./reviews");
const students = require("./students");

const constructorMethod = app => {
  app.use("/comments", comments);
  app.use("/courses", courses);
  app.use("/reviews", reviews);
  app.use("/students", students);
  
  app.get("/", (req, res) => {
    let studentLoggedIn = false;
    let studentId = req.session.AuthCookie;
    if(!studentId) {
      studentLoggedIn = false;
    } else {
      studentLoggedIn = true;
    }
    res.status(200).render("index", {studentLoggedIn: studentLoggedIn});
  });

  app.use('*', (req, res) => {
    res.status(404).json({ error: 'Not found' });  
  }); 
};

module.exports = constructorMethod;