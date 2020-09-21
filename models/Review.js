const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
	title: {
		type: String,
		trim: true,
		required: [true, "Please add a review title"],
		maxlength: 100
	},
	text: {
		type: String,
		required: [true, "Please add a description"]
	},
	rating: {
		type: Number,
		min: 1,
		max: 10,
		required: [true, "Please add a rating between 1 and 10"]
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
	},
	createdAt: {
		type: Date,
		default: Date.now
	}
});

ReviewSchema.index({ bootcamp: 1, user: 1 }, { unique: true });

ReviewSchema.statics.getAverageRating = async function (bootcamp) {
	const arr = await this.aggregate([
		{
			$match: {
				bootcamp
			}
		},
		{
			$group: {
				_id: "$bootcamp",
				averageRating: {
					$avg: "$rating"
				}
			}
		}
	]);

	await this.model("Bootcamp").findByIdAndUpdate(bootcamp, {
		averageRating: arr[0]?.averageRating
	});
};

ReviewSchema.post("remove", function () {
	this.constructor.getAverageRating(this.bootcamp);
});

ReviewSchema.post("save", function () {
	this.constructor.getAverageRating(this.bootcamp);
});

module.exports = mongoose.model("Review", ReviewSchema);
