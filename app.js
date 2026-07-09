const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const expressSession = require("express-session");
const Passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const MongoStore = require("connect-mongo").default;
app = express();

require("dotenv").config();
const flash = require("connect-flash");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const ExpressError = require("./utils/ExpressError.js");

const listingRouter = require("./routes/listings.js")
const reviewRouter = require("./routes/review.js")
const userRouter = require("./routes/user.js");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// -------------------- Database Connection --------------------
const dbUrl = process.env.ATLAS_DB_URL;
main()
    .then(() => {
        console.log("Connexted TO DB");
    })
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(dbUrl);
}

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET
    },
    touchAfter: 12 * 3600
});

store.on("error", () => {
    console.log("error in mongo session Store")
})

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true

}


app.use(expressSession(sessionOptions));
app.use(flash())
app.use(Passport.initialize())
app.use(Passport.session())
Passport.use(new LocalStrategy(User.authenticate()))

Passport.serializeUser(User.serializeUser());
Passport.deserializeUser(User.deserializeUser());


app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
})

app.engine("ejs", ejsMate);


// -------------------- Server Start --------------------

app.listen(3000, () => {
    console.log("Server Listening on port 3000");
});

// -------------------- Home Route --------------------

app.get("/", (req, res) => {

    res.render("landing/index.ejs");
});

// -------------------- Listing Routes--------------------

app.use("/listings", listingRouter)


// -------------------- Review Routes--------------------

app.use("/listings/:id/reviews", reviewRouter)

// -------------------- User Routes--------------------

app.use("/", userRouter);



// -------------------- 404 Route Handler --------------------

app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

// -------------------- Global Error Handling Middleware --------------------

app.use((err, req, res, next) => {
    let { statusCode = 500, message } = err;

    res.status(statusCode).send(message);
});