const router = require("express").Router({ mergeParams: true });
const Course = require("../models/Course");
const tunedResults = require("../middleware/tunedResults");
const { getCourses, getCourse, updateCourse, createCourse, deleteCourse } = require("../controllers/courses");
const { authenticate, authorize } = require("../middleware/auth");

router
	.route("/")
	.get(
		tunedResults(Course, {
			path: "bootcamp",
			select: "id"
		}),
		getCourses
	)
	.post(authenticate, authorize("publisher", "admin"), createCourse);

router
	.route("/:id")
	.get(getCourse)
	.put(authenticate, authorize("publisher", "admin"), updateCourse)
	.delete(authenticate, authorize("publisher", "admin"), deleteCourse);

module.exports = router;
