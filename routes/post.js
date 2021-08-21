const router = require("express").Router();
const Post = require("../models/Post.model.js");
const User = require("../models/User.model.js");
const mongoose = require("mongoose");
const { isLoggedIn } = require("../middleware/route-guard.js");

// Require fileUploader in order to use it
const fileUploader = require("../config/cloudinary.config");

// ****************************************************************************************
// create a new post
// ****************************************************************************************

router.get("/create", isLoggedIn, (req, res) => {
  res.render("posts/create");
});

router.post(
  "/create",
  isLoggedIn,
  fileUploader.single("post-image"),
  (req, res, next) => {
    const { author, title, content, city, routeLength} = req.body;
    const imageUrl = req.file?.path;

    Post.create({ author, title, content, city, routeLength, imageUrl })
      .then((newPost) => {
        return User.findByIdAndUpdate(author, {
          $push: { posts: newPost._id, newPost },
        });
      })
      .then(() => {
        res.redirect("/userProfile");
      })
      .catch((error) => {
        console.log("Error while creating the post: ", error);
        next(error);
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
        posts: postsFromDB,
      })
    )
    .catch((error) => {
      console.log(
        "Error while getting all the cycle routes from the DB",
        error
      );
      next(error);
    });
});

// ****************************************************************************************
// display details of the post
// ****************************************************************************************

router.get("/:postId/details", isLoggedIn, (req, res, next) => {
  const { postId } = req.params;
  Post.findById(postId)
    .populate("author")
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
  Post.findById(postId).then((postToEdit) => {
    res.render("posts/edit", { post: postToEdit });
  });
});

router.post(
  "/:postId/edit",
  isLoggedIn,
  fileUploader.single("post-image"),
  (req, res, next) => {
    const { postId } = req.params;
    const { author, title, city, routeLength, content } = req.body;
    const objectToEdit = { title, city, routeLength, content };

    if (req.file) {
      objectToEdit.imageUrl = req.file.path;
    }

    Post.findByIdAndUpdate(postId, objectToEdit, {new:true})
      .then((updatedPost) => {
        res.redirect(`/posts/${updatedPost._id}/details`);
      })
      .catch((error) => {
        console.log('Error while updating the post: ', error)
        next(error);
      });
  }
);

// ****************************************************************************************
// delete a post
// ****************************************************************************************

router.post("/:postId/delete", isLoggedIn, (req, res, next) => {
  const { postId } = req.params;
  Post.findByIdAndRemove(postId)
    .then(() => res.redirect("/userProfile"))
    .catch((error) => next(error));
});

module.exports = router;
