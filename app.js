// âšī¸ Gets access to environment variables/settings
// https://www.npmjs.com/package/dotenv
require("dotenv/config");

// âšī¸ Connects to the database
require("./db");

// Handles http requests (express is node js framework)
// https://www.npmjs.com/package/express
const express = require("express");

// Handles the handlebars
// https://www.npmjs.com/package/hbs
const hbs = require("hbs");
hbs.registerHelper("equal", require("handlebars-helper-equal"));

const app = express();

// This function is getting exported from the config folder. It runs most pieces of middleware
require("./config")(app);

// default value for title local
const projectName = "Bikepacker";
const capitalized = (string) =>
  string[0].toUpperCase() + string.slice(1).toLowerCase();

app.locals.title = `${capitalized(projectName)}`;

const localRes = require("./middleware/localRes");
app.use("/", localRes);

// đ Start handling routes here
const index = require("./routes/index");
app.use("/", index);

const cycleRoutes = require("./routes/post");
app.use("/posts", cycleRoutes);

const userRoutes = require("./routes/user");
app.use("/", userRoutes);

// â To handle errors. Routes that don't exist or errors that you handle in specific routes
require("./error-handling")(app);

module.exports = app;
