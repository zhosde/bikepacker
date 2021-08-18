const router = require("express").Router();
const Post = require("../models/Post.model.js");
const User = require("../models/User.model.js");
const mongoose = require("mongoose");
const { isLoggedIn, isLoggedOut } = require("../middleware/route-guard.js");

// Require fileUploader in order to use it
const fileUploader = require("../config/cloudinary.config");

// ****************************************************************************************
// create a new post
// ****************************************************************************************

router.get("/create", isLoggedIn, (req, res) => {
  User.find()
    .then((dbUsers) => {
      res.render("posts/create", { dbUsers });
    })
    .catch((err) =>
      console.log(`Err while creating post: ${err}`)
    );
});

router.post(
  "/create",
  isLoggedIn,
  fileUploader.single("post-image"),
  (req, res, next) => {
    const { title, author, city, routeLength, content, image } = req.body;

    Post.create({ title, author, city, routeLength, content, imageUrl })
      .then((dbPost) => {
        return User.findByIdAndUpdate(author, { $push: { posts: dbPost._id } });
      })
      .then(() => res.redirect("/"))
      .catch((err) => {
        console.log(`Err while creating the post in the DB: ${err}`);
        next(err);
      });
  }
);

// ****************************************************************************************
// display all the posts
// ****************************************************************************************

router.get("/", (req, res, next) => {
  Post.find()
    .populate("author")
    .then((postsFromDB) =>
      res.render("posts/list", {
        posts: postsFromDB
      })
    )
    .catch((error) => {
      console.log("Error while getting the cycle routes from the DB", error);
      next(error);
    });
});

// ****************************************************************************************
// display details of the post
// ****************************************************************************************

router.get("/:postId/details", isLoggedIn, (req, res, next) => {
  const { postId } = req.params;
  Post.findById(postId)
    .populate('author')
    .then((thePost) =>
      res.render("posts/details", { post: thePost })
    )
    .catch((error) => {
      console.log("Error while retrieving post details: ", error);
      next(error);
    });
});

// ****************************************************************************************
// edit a post
// ****************************************************************************************

router.get("/:postId/edit", isLoggedIn, (req, res) => {
  const { postId } = req.params;
  const {title, author, city, routeLength, content, imageUrl} = req.body;
  Post.findByIdAndUpdate(postId, {
    title,
    author,
    city,
    routeLength,
    content,
    imageUrl,
  }, {new: true}).then((updatedPost) => {
    res.ridrecter(`/${updatedPost.id}/details`)
    });
  });

// ****************************************************************************************
// delete a post
// ****************************************************************************************

router.post("/:postId/delete", isLoggedIn, (req, res, next) => {
  const { postId } = req.params;
  Post.findByIdAndRemove(postId)
    .then(() => res.redirect("/posts"))
    .catch((error) => next(error));
});


module.exports = router;
