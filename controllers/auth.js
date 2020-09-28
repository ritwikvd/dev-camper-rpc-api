const crypto = require("crypto");
const User = require("../models/User");
const asyncHandler = require("../middleware/asyncHandler");
const response = require("../middleware/response");
const sendEmail = require("../utils/sendEmail");

const getTokenForUser = user => {
	const token = user.getSignedJwtToken();

	const options = {
		expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 3600 * 1000),
		httpOnly: true
	};

	process.env.NODE_ENV == "production" ? (options.secure = true) : null;

	return { token, options };
};

// @desc Register user
// @route POST /api/v1/auth/register
// @access Public
exports.registerUser = asyncHandler(registerUser);

async function registerUser(req, res, next) {
	const user = await User.create(req.body);

	if (!user) return response(res, 400, { message: "Something went wrong" }, false);

	const { token, options } = getTokenForUser(user);

	res
		.status(200)
		.cookie("token", token, options)
		.json({ success: true, token, user: { name: user.name, role: user.role, email: user.email, id: user._id } });
}

// @desc Login user
// @route POST /api/v1/auth/login
// @access Public
exports.loginUser = asyncHandler(loginUser);

async function loginUser(req, res, next) {
	const { email, password } = req.body;

	if (!email || !password) return response(res, 400, { message: "Please provide an email and password" }, false);

	const user = await User.findOne({ email }).select("name role email password");

	if (!user || !(await user.matchPassword(password))) return response(res, 401, { message: "Invalid credentials" }, false);

	const { token, options } = getTokenForUser(user);

	res
		.status(200)
		.cookie("token", token, options)
		.json({ success: true, token, user: { name: user.name, role: user.role, email: user.email, id: user._id } });
}
//

// @desc Logout user
// @route GET /api/v1/auth/logout
// @access Private
exports.logoutUser = asyncHandler(logoutUser);

async function logoutUser(req, res, next) {
	res.cookie("token", "none", {
		expires: new Date(Date.now() + 10 * 1000),
		httpOnly: true
	});

	response(res, 200, { message: "You've been logged out successfully" }, true);
}
//

// @desc Get current logged in user
// @route GET /api/v1/auth/current
// @access Private
exports.getCurrentUser = asyncHandler(getCurrentUser);

async function getCurrentUser(req, res, next) {
	const user = await User.findById(req.user.id);

	if (!user) return response(res, 500, { message: "User could not be retrieved" }, false);

	response(res, 200, { data: user }, true);
}
//

// @desc Update user details
// @route PUT /api/v1/auth/updatedetails
// @access Private
exports.updateUserDetails = asyncHandler(updateUserDetails);

async function updateUserDetails(req, res, next) {
	const fields = {
		name: req.body.name,
		email: req.body.email
	};

	const user = await User.findByIdAndUpdate(req.user.id, fields, {
		new: true,
		runValidators: true
	});

	if (!user) return response(res, 500, { message: "User details could not be updated" }, false);

	response(res, 200, { data: user }, true);
}

// @desc Update password
// @route PUT /api/v1/auth/updatepassword
// @access Private
exports.updatePassword = asyncHandler(updatePassword);

async function updatePassword(req, res, next) {
	const user = await User.findById(req.user.id).select("+password");

	if (!user) return response(res, 500, { message: "User could not be retrieved" }, false);

	if (!(await user.matchPassword(req.body.currentPassword))) return response(res, 401, { message: "Current password is incorrect" }, false);

	user.password = req.body.newPassword;

	await user.save();

	const { token, options } = getTokenForUser(user);

	res.status(200).cookie("token", token, options).json({ success: true, token, data: "Your password has been updated" });
}
//
//

// @desc Forgot password
// @route POST /api/v1/auth/password
// @access Public
exports.emailResetLink = asyncHandler(emailResetLink);

async function emailResetLink(req, res, next) {
	const user = await User.findOne({ email: req.body.email });

	if (!user) return response(res, 404, { message: "The email entered does not exist" }, false);

	const token = await user.getResetPasswordToken();

	//reset url
	const url = `${req.protocol}://${req.get("host")}/api/v1/auth/password/${token}`;

	const message = `You are receving this email because you have requested
    the reset of your password. Please make a PUT request to: \n\n ${url}`;

	try {
		await sendEmail({
			email: user.email,
			subject: "Reset Password",
			message
		});

		response(res, 200, { data: "Email sent", resetToken: token }, true);
	} catch (error) {
		console.log(error);

		user.resetPasswordToken = undefined;
		user.resetPasswordExpired = undefined;

		await user.save({ validateBeforeSave: false });

		response(res, 500, { data: "Email could not be sent" }, false);
	}
}
//

// @desc Reset password
// @route PUT /api/v1/auth/password/:token
// @access Public
exports.resetPassword = asyncHandler(resetPassword);

async function resetPassword(req, res, next) {
	const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

	const user = await User.findOne({
		resetPasswordToken,
		resetPasswordExpired: {
			$gt: Date.now()
		}
	});

	if (!user)
		return response(res, 400, { message: "Your password could not be updated because your token has expired, please try again" }, false);

	user.password = req.body.password;
	user.resetPasswordToken = undefined;
	user.resetPasswordExpired = undefined;

	await user.save();

	const { token, options } = getTokenForUser(user);

	res
		.status(200)
		.cookie("token", token, options)
		.json({
			success: true,
			token,
			user: { name: user.name, role: user.role, email: user.email, id: user._id }
		});
}
