const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema({
	title: {
		type: String,
		trim: true,
		required: [true, "Please add a course title"]
	},
	description: {
		type: String,
		required: [true, "Please add a description"]
	},
	weeks: {
		type: String,
		required: [true, "Please add a duration"]
	},
	tuition: {
		type: Number,
		required: [true, "Please add a cost"]
	},
	minimumSkill: {
		type: String,
		required: [true, "Please add a minimum skill"],
		enum: ["beginner", "intermediate", "advanced"]
	},
	scholarshipAvailable: {
		type: Boolean,
		default: false
	},
	createdAt: {
		type: Date,
		default: Date.now
	},
	bootcamp: {
		type: mongoose.Schema.ObjectId,
		ref: "Bootcamp",
		required: true
	},
	user: {
		type: mongoose.Schema.ObjectId,
		ref: "User",
		required: true
	}
});

CourseSchema.statics.getAverageCost = async function (bootcamp) {
	const arr = await this.aggregate([
		{
			$match: {
				bootcamp
			}
		},
		{
			$group: {
				_id: "$bootcamp",
				averageCost: {
					$avg: "$tuition"
				}
			}
		}
	]);

	await this.model("Bootcamp").findByIdAndUpdate(bootcamp, {
		averageCost: Math.ceil(arr[0]?.averageCost) || undefined
	});
};

CourseSchema.post("remove", function () {
	this.constructor.getAverageCost(this.bootcamp);
});

CourseSchema.post("save", function () {
	this.constructor.getAverageCost(this.bootcamp);
});

module.exports = mongoose.model("Course", CourseSchema);
