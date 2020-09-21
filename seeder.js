const fs = require("fs");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
require("colors");

dotenv.config({ path: "./config/config.env" });

const Bootcamp = require("./models/Bootcamp");
const Course = require("./models/Course");
const User = require("./models/User");
const Review = require("./models/Review");

mongoose.connect(process.env.MONGO_URI, {
	useNewUrlParser: true,
	useCreateIndex: true,
	useFindAndModify: false,
	useUnifiedTopology: true
});

// const bootcamps = JSON.parse(
// 	fs.readFileSync(`${__dirname}/_data/bootcamps.json`, "utf-8")
// );

// const courses = JSON.parse(
// 	fs.readFileSync(`${__dirname}/_data/courses.json`, "utf-8")
// );

// const users = JSON.parse(
// 	fs.readFileSync(`${__dirname}/_data/users.json`, "utf-8")
// );

// const reviews = JSON.parse(
// 	fs.readFileSync(`${__dirname}/_data/reviews.json`, "utf-8")
// );

if (["destroy", "-d"].includes(process.argv[2]))
	Promise.all([Bootcamp.deleteMany(), Course.deleteMany(), User.deleteMany(), Review.deleteMany()])
		.then(() => {
			console.log("Database entries destroyed".red.inverse);
			process.exit();
		})
		.catch(err => console.log("Error destroying database entries " + err));
else
	Promise.all([
		// Bootcamp.create(bootcamps),
		// Course.create(courses),
		// Review.create(reviews),
		User.create({
			name: "Admin",
			email: "admin@gmail.com",
			role: "admin",
			password: "123456"
		})
	])
		.then(() => {
			console.log("Database entries created".green.inverse);
			process.exit();
		})
		.catch(err => console.log("Error creating database entries " + err));
