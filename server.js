//Import modules
const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const errorHandler = require("./middleware/error");
const fileuploader = require("express-fileupload");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const sanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const path = require("path");
const nocache = require("nocache");
require("colors");
//

//Set environment config path
dotenv.config({ path: "./config/config.env" });

//Initialize Mongo DB
require("./config/mongoose")();

//Import routes
const bootcamp = require("./routes/bootcamps");
const course = require("./routes/courses");
const auth = require("./routes/auth");
const reviews = require("./routes/reviews");
//

//Variables
const app = express();
const PORT = process.env.PORT || 8000;
//

//Initialize middleware
app.use(express.static(path.join(__dirname, "public")));

app.use(express.json());
process.env.NODE_ENV == "development" ? app.use(morgan("dev")) : null;
app.use(fileuploader());
app.use(cookieParser());
app.use(cors());

//Security middleware
app.use(sanitize());
app.use(helmet());
app.use(xss());
app.use(hpp());

const limiter = rateLimit({
	windowMs: 10 * 60 * 1000,
	max: 100
});

app.use(limiter);
//

//Response middleware
app.use(nocache());
app.use((_, res, next) => {
	res.setHeader("Content-Security-Policy", "script-src 'self' https://kit.fontawesome.com/3da1a747b2.js");
	return next();
});
//

//Set routers
app.get("/", (_, res) => res.end("You might be looking for this: https://dev-camper-client-react-redux.herokuapp.com/"));
app.use("/api/v1/bootcamps", bootcamp);
app.use("/api/v1/courses", course);
app.use("/api/v1/auth", auth);
app.use("/api/v1/reviews", reviews);
//

//Use React build
// app.use(express.static("../client-react-redux/build"));

// app.get("*", (_, res) => res.sendFile(path.resolve("../client-react-redux/build/index.html")));
//

//Error middleware
app.use(errorHandler);
//

//Start server
const server = app.listen(PORT, console.log(`yoohoo from ${process.env.NODE_ENV} mode on port: ${PORT}`.yellow.bold));

//Error handler
process.on("unhandledRejection", error => {
	console.log(`Unhandled rejection: ${error}`.red);
	console.trace();
	server.close(() => process.exit(1));
});
