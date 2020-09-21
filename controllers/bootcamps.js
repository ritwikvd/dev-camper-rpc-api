const Bootcamp = require("../models/Bootcamp");
const asyncHandler = require("../middleware/asyncHandler");
const response = require("../middleware/response");
const geocoder = require("../config/geocoder");
const path = require("path");

// @desc Get all bootcamps
// @route GET /api/v1/bootcamps
// @access Public
exports.getBootcamps = asyncHandler(getAll);

async function getAll(req, res, next) {
	const { tunedResults } = res;

	if (!tunedResults.data) return response(res, 404, { message: "No results found" }, false);

	response(res, 200, tunedResults, true);
}

// @desc Get a bootcamp by id
// @route GET /api/v1/bootcamps/:id
// @access Public
exports.getBootcamp = asyncHandler(getById);

async function getById(req, res, next) {
	const camp = await Bootcamp.findById(req.params.id).populate({ path: "courses" });

	if (!camp) return response(res, 404, { message: `No bootcamp with id: ${req.params.id}  found` }, false);

	response(res, 200, { data: camp }, true);
}

// @desc Get a bootcamp by user ID
// @route GET /api/v1/bootcamps/user/:id
// @access Public
exports.getBootcampByUser = asyncHandler(getByUserId);

async function getByUserId(req, res, next) {
	const camp = await Bootcamp.find({ user: req.params.id }).populate({ path: "courses" });

	if (!camp || !camp.length) return response(res, 404, { message: `No bootcamp with id: ${req.params.id}  found` }, false);

	response(res, 200, { data: camp[0] }, true);
}

// @desc Create a bootcamp
// @route POST /api/v1/bootcamps
// @access Public
exports.createBootcamp = asyncHandler(create);

async function create(req, res, next) {
	const { id, role } = req.user;

	if (role != "admin") {
		const published = await Bootcamp.findOne({ user: id });

		if (published) return response(res, 400, { message: `You have already published a bootcamp` }, false);
	}

	req.body.user = id;

	const camp = await (await Bootcamp.create(req.body)).populate({ path: "courses" });

	if (!camp) return response(res, 500, { message: `Failed to create new bootcamp` }, false);

	response(res, 201, { data: camp }, true);
}

// @desc Update a bootcamp
// @route PUT /api/v1/bootcamps/:id
// @access Private
exports.updateBootcamp = asyncHandler(update);

async function update(req, res, next) {
	const { id: userId, role } = req.user;

	const canUpdate = ["admin"].includes(role);

	let bootcamp = await Bootcamp.findById(req.params.id);

	if (!bootcamp) return response(res, 404, { message: `No bootcamp with id: ${req.params.id}  found` }, false);

	if (!canUpdate && userId != bootcamp.user) return response(res, 401, { message: `You cannot update this bootcamp` }, false);

	bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true
	}).populate({ path: "courses" });

	await bootcamp.save();

	if (!bootcamp) return response(res, 404, { message: `No bootcamp with id: ${req.params.id}  found` }, false);

	response(res, 200, { data: bootcamp }, true);
}

// @desc Delete a bootcamp
// @route DELETE /api/v1/bootcamps/:id
// @access Private
exports.deleteBootcamp = asyncHandler(deleteBootcamp);

async function deleteBootcamp(req, res, next) {
	const bootcamp = await Bootcamp.findById(req.params.id);

	if (!bootcamp) return response(res, 400, { message: `No bootcamp with id: ${req.params.id}  found` }, false);

	const { id: userId, role } = req.user;

	const canUpdate = ["admin"].includes(role);

	if (!canUpdate && userId != bootcamp.user) return response(res, 401, { message: `You cannot delete this bootcamp` }, false);

	bootcamp.remove();

	response(res, 200, { data: bootcamp }, true);
}

// @desc Upload a bootcamp photo
// @route PUT /api/v1/bootcamps/:id/photo
// @access Private
exports.uploadPhoto = asyncHandler(uploadPhoto);

async function uploadPhoto(req, res, next) {
	const camp = await Bootcamp.findById(req.params.id);

	if (!camp) return response(res, 404, { message: `No bootcamp with id: ${req.params.id}  found` }, false);

	const { id: userId, role } = req.user;

	const canUpdate = ["admin"].includes(role);

	if (!canUpdate && userId != camp.user) return response(res, 401, { message: `You cannot update this bootcamp` }, false);

	if (!req.files?.file) return response(res, 400, { message: `No files uploaded` }, false);

	const { file } = req.files;

	if (!file.mimetype.startsWith("image")) return response(res, 400, { message: `Please upload a valid image` }, false);

	if (file.size > process.env.MAX_FILE_SIZE)
		return response(res, 400, { message: `Please upload an image with size lesser than ${process.env.MAX_FILE_SIZE}` }, false);

	file.name = `photo_${camp._id}${path.parse(file.name).ext}`;

	file.mv(`${process.env.FILE_PATH}/${file.name}`, async err => {
		if (err) {
			console.log(err);
			return response(res, 500, { message: "Error uploading file to server" }, false);
		}

		await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });

		response(res, 200, { path: `/uploads/${file.name}` }, true);
	});
}

// @desc Get bootcamps within radius
// @route DELETE /api/v1/bootcamps/:zipcode/:distance
// @access Public
exports.getBootcampsWithinRadius = asyncHandler(getBootcampsWithinRadius);

async function getBootcampsWithinRadius(req, res, next) {
	const { zipcode, distance } = req.params;
	const loc = await geocoder.geocode(zipcode);
	const { latitude, longitude } = loc[0];

	const radius = distance / 6378;

	let bootcamps = await Bootcamp.find({
		location: {
			$geoWithin: { $centerSphere: [[longitude, latitude], radius] }
		}
	});

	response(res, 200, { count: bootcamps.length, data: bootcamps }, true);
}
