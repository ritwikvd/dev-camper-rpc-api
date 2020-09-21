const router = require("express").Router();
const {
	registerUser,
	loginUser,
	getCurrentUser,
	emailResetLink,
	resetPassword,
	updateUserDetails,
	updatePassword,
	logoutUser
} = require("../controllers/auth");
const { authenticate, authorize } = require("../middleware/auth");

//Re-route users
const userRouter = require("./users");
router.use("/users", userRouter);
//

router.route("/register").post(registerUser);

router.route("/login").post(loginUser);

router.route("/logout").get(authenticate, logoutUser);

router.route("/current").get(authenticate, authorize("publisher", "admin"), getCurrentUser);

router.route("/password").post(emailResetLink);

router.route("/password/:token").put(resetPassword);

router.route("/updatedetails").put(authenticate, updateUserDetails);

router.route("/updatepassword").put(authenticate, updatePassword);

module.exports = router;
