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
    let userLoggedIn = false;
    let authCookie = req.session.AuthCookie;
    if(!authCookie) {
      userLoggedIn = false;
    } else {
      userLoggedIn = true;
    }
    res.status(200).render("index", {userLoggedIn: userLoggedIn});
  });

  app.use('*', (req, res) => {
    res.status(404).json({ error: 'Not found' });  
  }); 
};

module.exports = constructorMethod;