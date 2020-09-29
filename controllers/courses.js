const Course = require("../models/Course");
const Bootcamp = require("../models/Bootcamp");
const asyncHandler = require("../middleware/asyncHandler");
const response = require("../middleware/response");

// @desc Get courses
// @route GET /api/v1/courses
// @route GET /api/v1/bootcamps/:bootcampId/courses
// @access Public
exports.getCourses = asyncHandler(getCourses);

async function getCourses(req, res) {
	const { tunedResults } = res;

	if (!tunedResults.data) return response(res, 404, { message: "No courses found" }, false);

	response(res, 200, tunedResults, true);
}

// @desc Get a course
// @route GET /api/v1/courses/:id
// @access Public
exports.getCourse = asyncHandler(getCourse);

async function getCourse(req, res) {
	const course = await Course.findById(req.params.id).populate({
		path: "bootcamp",
		select: "name description"
	});

	if (!course) return response(res, 404, { message: "No courses found" }, false);

	response(res, 200, { data: course }, true);
}

// @desc Create a course
// @route POST /api/v1/courses
// @access Private
exports.createCourse = asyncHandler(createCourse);

async function createCourse(req, res) {
	const bootcamp = await Bootcamp.findById(req.body.id);

	if (!bootcamp) return response(res, 400, { message: `No bootcamp with id: ${req.body.bootcamp}  found, please check that field` }, false);

	req.body.user = req.user.id;

	req.body.bootcamp = bootcamp.id;

	const { id: userId, role } = req.user;

	const canUpdate = ["admin"].includes(role);

	if (!canUpdate && userId != bootcamp.user) return response(res, 401, { message: `You cannot add a course to this bootcamp` }, false);

	const course = await Course.create(req.body);

	if (!course) return response(res, 400, { message: "Error creating course" }, false);

	const { averageCost: avgCost } = await Bootcamp.findById(bootcamp.id).select("averageCost");

	response(res, 200, { data: course, avgCost }, true);
}

// @desc Update a course
// @route PUT /api/v1/courses/:id
// @access Private
exports.updateCourse = asyncHandler(updateCourse);

async function updateCourse(req, res) {
	let course = await Course.findById(req.params.id);

	if (!course) return response(res, 404, { message: "No course found" }, false);

	const { id: userId, role } = req.user;

	const canUpdate = ["admin"].includes(role);

	if (!canUpdate && userId != course.user)
		return response(res, 401, { message: `You cannot update this course from this bootcamp` }, false);

	course = await Course.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true
	});

	await course.save();

	const { averageCost: avgCost } = await Bootcamp.findById(course.bootcamp).select("averageCost");

	if (!course) return response(res, 404, { message: "No course found" }, false);

	response(res, 200, { data: course, avgCost }, true);
}

// @desc Delete a course
// @route DELETE /api/v1/courses/:id
// @access Private
exports.deleteCourse = asyncHandler(deleteCourse);

async function deleteCourse(req, res) {
	const course = await Course.findById(req.params.id);

	if (!course) return response(res, 404, { message: "No course found" }, false);

	const { id: userId, role } = req.user;

	const canUpdate = ["admin"].includes(role);

	if (!canUpdate && userId != course.user)
		return response(res, 401, { message: `You cannot delete this course from this bootcamp` }, false);

	await course.remove();

	const { averageCost: avgCost } = await Bootcamp.findById(course.bootcamp).select("averageCost");

	response(res, 200, { data: course, avgCost }, true);
}
