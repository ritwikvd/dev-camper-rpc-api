const router = require("express").Router();
const User = require("../models/User");
const { getUser, getUsers, createUser, updateUser, deleteUser } = require("../controllers/users");
const { authenticate, authorize } = require("../middleware/auth");
const tunedResults = require("../middleware/tunedResults");

router.use(authenticate);
router.use(authorize("admin"));

router
    .route("/")
    .get(tunedResults(User), getUsers)
    .post(createUser);

router
    .route("/:id")
    .get(getUser)
    .put(updateUser)
    .delete(deleteUser);

module.exports = router;