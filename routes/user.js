const router = require("express").Router();
const mongoose = require("mongoose");

const bcryptjs = require("bcryptjs");
const saltRounds = 10;

const User = require("../models/User.model");
const Post = require("../models/Post.model");

// require auth middleware
const { isLoggedIn, isLoggedOut } = require("../middleware/route-guard.js");

//////////// S I G N U P ///////////

// GET route ==> to display the signup form to users
router.get("/signup", isLoggedOut, (req, res) => res.render("auth/signup"));

// POST route ==> to process form data
router.post("/signup", isLoggedOut, (req, res, next) => {
  const { username, email, password } = req.body;

  // make sure users fill all mandatory fields
  if (!username || !email || !password) {
    res.render("auth/signup", {
      errorMessage: "All fields are mandatory.",
    });
    return;
  }
  // make sure passwords are strong
  const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
  if (!regex.test(password)) {
    res.status(500).render("auth/signup", {
      errorMessage:
        "Password needs to have at least 6 chars and must contain at least one number, one lowercase and one uppercase letter.",
    });
    return;
  }

  bcryptjs
    .genSalt(saltRounds)
    .then((salt) => bcryptjs.hash(password, salt))
    .then((hashedPassword) => {
      return User.create({
        username,
        email,
        passwordHash: hashedPassword,
      });
    })
    .then((user) => {
      req.session.user = user;
      res.redirect("/userProfile");
    })
    .catch((error) => {
      // make sure error message becomes visible to users
      if (error instanceof mongoose.Error.ValidationError) {
        res.status(500).render("auth/signup", { errorMessage: error.message });
      }
      // make sure no duplicated data
      else if (error.code === 11000) {
        res.status(500).render("auth/signup", {
          errorMessage:
            "Username and email need to be unique. Either username or email is already used.",
        });
      } else {
        next(error);
      }
    });
});

//////////// L O G I N ///////////

// GET route ==> to display the login form to users
router.get("/login", isLoggedOut, (req, res) => res.render("auth/login"));

// POST login route ==> to process form data
router.post("/login", isLoggedOut, (req, res, next) => {
  const { email, password } = req.body;
  // make sure users fill in the requested inputs
  if (email === "" || password === "") {
    res.render("auth/login", {
      errorMessage: "Please enter both, email and password to login.",
    });
    return;
  }
  // look through the database and check if there’s a user in the users collection
  // that has been registered using the email
  User.findOne({ email })
    // get response from DB
    .then((user) => {
      if (!user) {
        res.render("auth/login", {
          errorMessage: "Email is not registered. Try with other email.",
        });
        return;
        // if there's a user, compare provided password
        // with the hashed password saved in the database
      } else if (bcryptjs.compareSync(password, user.passwordHash)) {
        //res.render("users/user-profile", { user });
        //******* SAVE THE USER IN THE SESSION ********//
        req.session.user = user;
        res.redirect("/userProfile");
      } else {
        res.render("auth/login", { errorMessage: "Incorrect password." });
      }
    })
    .catch((error) => next(error));
});

//////////// User Profile ///////////

router.get("/userProfile", isLoggedIn, (req, res, next) => {
  const userId = req.session.user._id;
  User.findById(userId)
    .then((userFromDB) => {
      res.render("users/user-profile", { user: userFromDB });
    })
    .catch((err) => {
      console.log(`Error while getting user profile: ${err}`);
      next(err);
    });
});

//////////// L O G O U T ///////////

router.post("/logout", isLoggedIn, (req, res, next) => {
  req.session.destroy((err) => {
    if (err) next(err);
    res.redirect("/");
  });
});

module.exports = router;
