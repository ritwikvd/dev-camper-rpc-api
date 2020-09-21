const geocoder = require("../config/geocoder");

const tunedResults = (model, populate) => async (req, res, next) => {
	const reqParameters = { ...req.query };

	if (req.params.bootcampId) reqParameters.bootcamp = req.params.bootcampId;

	//Geolocation
	const { zip, miles } = req.query;
	if (zip && miles) {
		const loc = await geocoder.geocode(zip);
		const { latitude, longitude } = loc[0];

		const radius = miles / 6378;

		reqParameters.location = {
			$geoWithin: { $centerSphere: [[longitude, latitude], radius] }
		};
	}
	//

	//Do not consider these params while querying; to be used for filtering
	const removeFields = ["select", "sort", "limit", "page", "zip", "miles"];

	removeFields.forEach(item => delete reqParameters[item]);

	//Convert to desired mongo format when querying by averageCost
	let query = JSON.stringify(reqParameters);
	query = query.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
	//

	//Select fields
	let fields = "";
	if (req.query.select) fields = req.query.select.split(",").join(" ");
	//

	//Sort
	let sortFields = "";
	if (req.query.sort) sortFields = req.query.sort.split(",").join(" ");
	else sortFields = "createdAt";
	//

	//Pagination
	const page = parseInt(req.query.page) || 1;
	const limit = parseInt(req.query.limit) || 25;
	const skip = (page - 1) * limit;
	const total = await model.countDocuments(JSON.parse(query));
	//

	const results = await model.find(JSON.parse(query)).populate(populate).select(fields).sort(sortFields).skip(skip).limit(limit);

	//Pagination
	const pagination = { total };

	if (skip < total - limit) pagination.next = { page: page + 1, limit };
	if (skip) pagination.prev = { page: page - 1, limit };
	//

	res.tunedResults = {
		count: results.length,
		pagination,
		data: results
	};

	next();
};

module.exports = tunedResults;
