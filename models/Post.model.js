const { Schema, model } = require("mongoose");

const postSchema = new Schema(
  {
    title: String,
    city: String,
    routeLength: String,
    content: String,
    author: { type: Schema.Types.ObjectId, ref: "User" },
    image: String,
  },
  {
    timestamps: true,
  }
);

const Post = model("Post", postSchema);

module.exports = Post;
