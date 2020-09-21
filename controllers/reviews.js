const Review = require("../models/Review");
const Bootcamp = require("../models/Bootcamp");
const asyncHandler = require("../middleware/asyncHandler");
const response = require("../middleware/response");

// @desc Get all reviews
// @route GET /api/v1/reviews
// @route GET /api/v1/bootcamps/:bootcampId/reviews
// @access Public
exports.getReviews = asyncHandler(getReviews);

async function getReviews(req, res) {
	const { tunedResults } = res;

	if (!tunedResults.data) return response(res, 404, { message: "No reviews found" }, false);

	response(res, 200, tunedResults, true);
}
//

// @desc Create a review
// @route POST /api/v1/bootcamps/:bootcampId/reviews
// @access Private
exports.createReview = asyncHandler(createReview);

async function createReview(req, res) {
	req.body.user = req.user.id;

	req.body.bootcamp = req.params.bootcampId;

	const bootcamp = await Bootcamp.findById(req.params.bootcampId);

	if (!bootcamp) return response(res, 404, { message: "Bootcamp doesn't exist" }, false);

	const review = await Review.create(req.body);

	if (!review) return response(res, 500, { message: "Unable to create review" }, false);

	response(res, 201, { data: review }, true);
}
//

// @desc Get a review
// @route GET /api/v1/reviews/:id
// @access Public
exports.getReview = asyncHandler(getReview);

async function getReview(req, res) {
	const review = await Review.findById(req.params.id).populate({
		path: "bootcamp",
		select: "name description"
	});

	if (!review) return response(res, 404, { message: "No review found" }, false);

	response(res, 200, { data: review }, true);
}
//

// @desc Get user's review
// @route GET /api/v1/reviews/user/:id
// @access Public
exports.getUserReviews = asyncHandler(getUserReviews);

async function getUserReviews(req, res) {
	const review = await Review.find({ user: req.params.id }).populate({
		path: "bootcamp",
		select: "name description"
	});

	if (!review) return response(res, 404, { message: "No reviews found" }, false);

	response(res, 200, { data: review }, true);
}
//

// @desc Update a  review
// @route PUT /api/v1/reviews/:id
// @access Private
exports.updateReview = asyncHandler(updateReview);

async function updateReview(req, res) {
	let review = await Review.findById(req.params.id);

	if (!review) return response(res, 404, { message: "Review not found" }, false);

	if (req.user.id != review.user && req.user.role != "admin")
		return response(res, 401, { message: "You cannot update this review" }, false);

	for (let a in req.body) review[a] = req.body[a];

	await review.save();

	review = await Review.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true
	}).populate({ path: "bootcamp", select: "name" });

	if (!review) return response(res, 500, { message: "Unable to update review" }, false);

	response(res, 200, { data: review }, true);
}
//

// @desc Delete a review
// @route DEL /api/v1/reviews/:id
// @access Private
exports.deleteReview = asyncHandler(deleteReview);

async function deleteReview(req, res) {
	let review = await Review.findById(req.params.id);

	if (!review) return response(res, 404, { message: "Review not found" }, false);

	if (req.user.id != review.user && req.user.role != "admin")
		return response(res, 401, { message: "You cannot delete this review" }, false);

	await review.remove();

	response(res, 200, { data: review }, true);
}
//
