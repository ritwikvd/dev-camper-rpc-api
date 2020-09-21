const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const UserSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, "Please add a name"]
	},
	email: {
		type: String,
		unique: true,
		required: [true, "Please add an email"],
		match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please add a valid email"]
	},
	role: {
		type: String,
		enum: ["user", "publisher", "admin"],
		default: "user"
	},
	password: {
		type: String,
		required: [true, "Please add a password"],
		minlength: 6,
		select: false
	},
	resetPasswordToken: String,
	resetPasswordExpired: Date,
	createdAt: {
		type: Date,
		default: Date.now
	}
});

UserSchema.pre("save", async function (next) {
	if (!this.isModified("password")) next();

	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.getSignedJwtToken = function () {
	return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRE
	});
};

UserSchema.methods.matchPassword = async function (password) {
	return await bcrypt.compare(password, this.password);
};

UserSchema.methods.getResetPasswordToken = async function () {
	const token = crypto.randomBytes(20).toString("hex");

	this.resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");

	this.resetPasswordExpired = Date.now() + 10 * 60 * 1000;

	await this.save({ validateBeforeSave: false });

	return token;
};

module.exports = mongoose.model("User", UserSchema);
