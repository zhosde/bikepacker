const mongoose = require("mongoose");
const Post = require("../models/Post.model");

const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost/Bikepacker";

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
});

// const cycleRoutes = [
//   {
//     title: "Neckartal",
//     content:
//       "The Neckartal Cycle Route is a signposted cycle route along the Neckar.",
//     city: "from Villingen-Schwenningen to Mannheim",
//     routeLength: "410km",
//     author: "Ninja",
//     image: "/images/neckartal.png",
//   },
//   {
//     title: "Donau-Bodensee",
//     content:
//       "The Donau-Bodensee Cycle Route is a cycle route in southeast Germany.",
//     city: "from Friedrichshafen to Ulm",
//     routeLength: "430km",
//     author: "Ninja",
//     image: "/images/donau-bodensee.png",
//   },
// ];

// Post.create(cycleRoutes)
//   .then((cycleRoutesFromDB) => {
//     console.log(`Created ${cycleRoutesFromDB.routeLength} cycle routes`);

//     // Once created, close the DB connection
//     mongoose.connection.close();
//   })
//   .catch((err) =>
//     console.log(
//       `An error occurred while creating cycle routes from the DB: ${err}`
//     )
//   );
