const router = require("express").Router();
const Bootcamp = require("../models/Bootcamp");
const tunedResults = require("../middleware/tunedResults");
const {
	getBootcamps,
	getBootcamp,
	getBootcampByUser,
	createBootcamp,
	updateBootcamp,
	deleteBootcamp,
	getBootcampsWithinRadius,
	uploadPhoto
} = require("../controllers/bootcamps");
const { authenticate, authorize } = require("../middleware/auth");

//Re-route courses
const courseRouter = require("./courses");
router.use("/:bootcampId/courses", courseRouter);
//

//Re-route reviews
const reviewRouter = require("./reviews");
router.use("/:bootcampId/reviews", reviewRouter);
//

router
	.route("/")
	.get(
		tunedResults(Bootcamp, {
			path: "courses"
			// select: "id"
		}),
		getBootcamps
	)
	.post(authenticate, authorize("publisher", "admin"), createBootcamp);

router
	.route("/:id")
	.get(getBootcamp)
	.put(authenticate, authorize("publisher", "admin"), updateBootcamp)
	.delete(authenticate, authorize("publisher", "admin"), deleteBootcamp);

router.route("/user/:id").get(authenticate, getBootcampByUser);

router.route("/:id/photo").put(authenticate, authorize("publisher", "admin"), uploadPhoto);

router.route("/radius/:zipcode/:distance").get(tunedResults(Bootcamp), getBootcampsWithinRadius);

module.exports = router;
