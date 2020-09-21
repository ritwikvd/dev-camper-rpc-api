const User = require("../models/User");
const asyncHandler = require("../middleware/asyncHandler");
const response = require("../middleware/response");

// @desc Get all users
// @route GET /api/v1/auth/users
// @access Private/ Admin
exports.getUsers = asyncHandler(getUsers);

async function getUsers(req, res, next) {
    const { tunedResults } = res;

    if (!tunedResults.data) return response(res, 404, { message: "No results found" }, false);

    response(res, 200, tunedResults, true);
}
//

// @desc Get a user
// @route GET /api/v1/auth/users/:id
// @access Private/ Admin
exports.getUser = asyncHandler(getUser);

async function getUser(req, res, next) {
    const user = await User.findById(req.params.id);

    if (!user) return response(res, 404, { message: "No results found" }, false);

    response(res, 200, { data: user }, true);
}
//

// @desc Update a user
// @route PUT /api/v1/auth/users/:id
// @access Private/ Admin
exports.updateUser = asyncHandler(updateUser);

async function updateUser(req, res, next) {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!user) return response(res, 500, { message: "Could not update user" }, false);

    response(res, 200, { data: user }, true);
}
//

// @desc Create a user
// @route POST /api/v1/auth/users/
// @access Private/ Admin
exports.createUser = asyncHandler(createUser);

async function createUser(req, res, next) {
    const user = await User.create(req.body);

    if (!user) return response(res, 500, { message: "Could not create user" }, false);

    response(res, 201, { data: user }, true);
}
//

// @desc Delete a user
// @route DEL /api/v1/auth/users/:id
// @access Private/ Admin
exports.deleteUser = asyncHandler(deleteUser);

async function deleteUser(req, res, next) {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) return response(res, 500, { message: "Could not delete user" }, false);

    response(res, 200, { data: user }, true);
}
//