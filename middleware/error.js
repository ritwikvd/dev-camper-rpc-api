const ErrorResponse = require("../utils/errorResponse");

module.exports = (err, req, res, next) => {
	const error = new ErrorResponse("Something went wrong", 500);

	console.log(err.red);

	if ([11000].includes(err.code)) error.status = 400;

	switch (err.name) {
		case "CastError":
			error.message = "Resource not found";
			error.status = 400;
			break;
		case "ValidationError":
			error.message = err.message;
			error.status = 400;
			break;
		case "MongoError":
			switch (err.code) {
				case 11000:
					error.message = "You have already performed this action";
			}
			break;
		default:
			error.message = err.message;
			error.status = err.status;
			break;
	}

	res.status(error.status).json({ success: false, error: error.message });
};
