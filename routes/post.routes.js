const router = require("express").Router();
const Post = require("../models/Post.model.js");
const User = require("../models/User.model.js");

// ****************************************************************************************
// create a new post
// ****************************************************************************************

router.get("/post-create", (req, res) => {
  User.find()
    .then((dbUsers) => {
      res.render("posts/create", { dbUsers });
    })
    .catch((err) =>
      console.log(`Err while displaying post input page: ${err}`)
    );
});

router.post("/post-create", (req, res, next) => {
  const { title, author, city, routeLength, content, image } = req.body;

  Post.create({ title, author, city, routeLength, content, image })
    .then((dbPost) => {
      return User.findByIdAndUpdate(author, { $push: { posts: dbPost._id } });
    })
    .then(() => res.redirect("/cycle-routes"))
    .catch((err) => {
      console.log(`Err while creating the post in the DB: ${err}`);
      next(err);
    });
});

// ****************************************************************************************
// display all the posts
// ****************************************************************************************

router.get("/cycle-routes", (req, res, next) => {
  Post.find()
    .populate('author')
    .then((dbPosts) =>
      res.render("posts/list", {
        posts: dbPosts
      })
    )
    .catch((error) => {
      console.log("Error while getting the cycle routes from the DB", error);
      next(error);
    });
});

// ****************************************************************************************
// display detail of the post
// ****************************************************************************************

router.get("/cycle-routes/:postId", (req, res) => {
  const { postId } = req.params;
  Post.findById(postId)
    .populate('author')
    .then((thePost) =>
      res.render("posts/details", { post: thePost })
    )
    .catch((error) => {
      console.log("Error while retrieving cycle route details: ", error);
      next(error);
    });
});

module.exports = router;
