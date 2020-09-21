const router = require("express").Router({ mergeParams: true });
const Review = require("../models/Review");
const tunedResults = require("../middleware/tunedResults");
const { getReviews, getReview, createReview, updateReview, deleteReview, getUserReviews } = require("../controllers/reviews");
const { authenticate, authorize } = require("../middleware/auth");

router
	.route("/")
	.get(
		tunedResults(Review, {
			path: "user",
			select: "name"
		}),
		getReviews
	)
	.post(authenticate, authorize("user", "admin"), createReview);

router
	.route("/:id")
	.get(getReview)
	.put(authenticate, authorize("user", "admin"), updateReview)
	.delete(authenticate, authorize("user", "admin"), deleteReview);

router.route("/user/:id").get(authenticate, getUserReviews);

module.exports = router;
