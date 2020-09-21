module.exports = class ErrorResponse extends Error {
	constructor(msg, status) {
		super(msg);
		this.status = status;
	}
};
