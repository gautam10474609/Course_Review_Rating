const express = require('express');
const app = express();
const exphbs = require('express-handlebars');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const configRoutes = require('./routes');
const static = express.static(__dirname + '/public');

app.use(cookieParser());
app.use(cors());
app.use('/public', static);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
    session({
        name: 'AuthCookie',
        secret: 'some secret string!',
        resave: false,
        saveUninitialized: true
    })
);

app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');


app.use(function(request, response, next) {
  console.log('Timestamp ' + new Date().toUTCString());
  console.log('Request Method: ' + request.method);
  console.log('Request Routes: ' + request.originalUrl);
  next();
  if(request.session) {
    if(!request.session.AuthCookie) {
      console.log("Students is not Authenticated yet!")
    }
    else {
      console.log("Students is Authenticated!");
    } 
  } else {
    if(request.originalUrl == '/logout')
      console.log('Students has been logged out!');
    else
      console.log("Students is not Authenticated yet!")
  }
  console.log("---------------------------------------------------")
});

app.use("/profile", function(req, res, next){
    if(!req.session.AuthCookie) {
      let isErrors = true;
      let errors = [];
      errors.push("Not Logged In, Please Login");
      res.status(403).render("layouts/main", {isErrors:isErrors, errors: errors});
    } else {
      next();
    }
  });

configRoutes(app);

app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log("Routes will be running on http://localhost:3000")
  if (process && process.send) {
    process.send({done: true});
  }
});