const jwt = require("jsonwebtoken");
const ErrorResponse = require("../utils/errorResponse");
const User = require("../models/User");

exports.authenticate = async (req, res, next) => {
	let token;

	const { authorization } = req.headers;

	token = authorization && authorization.startsWith("Bearer") ? authorization.split(" ")[1] : null;

	if (req.cookies.token) token = req.cookies.token;

	if (!token) return next(new ErrorResponse("Not authorized to access this route", 401));

	try {
		const { id } = jwt.verify(token, process.env.JWT_SECRET);

		req.user = await User.findById(id);

		next();
	} catch (error) {
		next(new ErrorResponse("Not authorized to access this route", 401));
	}
};

exports.authorize = (...roles) => {
	return (req, res, next) => {
		const { role } = req.user;

		if (!roles.includes(role)) return next(new ErrorResponse(`${role[0].toUpperCase() + role.slice(1)}s cannot perform this action`, 403));

		next();
	};
};
