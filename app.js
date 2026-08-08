require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const expressSession = require("express-session");
const Passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const MongoStore = require("connect-mongo").default;
const flash = require("connect-flash");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const ExpressError = require("./utils/ExpressError.js");

const listingRouter = require("./routes/listings.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const bookingRouter = require("./routes/booking.js");
const Listing = require("./models/listing.js");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

// -------------------- Database Connection --------------------
const defaultDbUrl = "mongodb://127.0.0.1:27017/wanderlust";
const atlasUrl = process.env.ATLAS_DB_URL;

async function connectDB() {
    if (atlasUrl) {
        try {
            await mongoose.connect(atlasUrl, { serverSelectionTimeoutMS: 2500 });
            console.log("Connected to MongoDB Atlas");
            return;
        } catch (err) {
            console.warn("Atlas connection failed, falling back to local MongoDB:", err.message);
        }
    }
    await mongoose.connect(defaultDbUrl);
    console.log("Connected to local MongoDB:", defaultDbUrl);
}

connectDB().then(() => {
    const store = MongoStore.create({
        client: mongoose.connection.getClient(),
        crypto: {
            secret: process.env.SECRET || "stayfindersecretkey"
        },
        touchAfter: 12 * 3600
    });

    store.on("error", (err) => {
        console.error("Error in Mongo session Store:", err);
    });

    const sessionOptions = {
        store,
        secret: process.env.SECRET || "stayfindersecretkey",
        resave: false,
        saveUninitialized: true,
        cookie: {
            httpOnly: true,
            expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
            maxAge: 7 * 24 * 60 * 60 * 1000
        }
    };

    app.use(expressSession(sessionOptions));
    app.use(flash());
    app.use(Passport.initialize());
    app.use(Passport.session());
    Passport.use(new LocalStrategy(User.authenticate()));

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
    });

    // -------------------- Home Route --------------------
    app.get("/", async (req, res) => {
        try {
            const featuredListings = await Listing.find({}).limit(6);
            res.render("landing/index.ejs", { featuredListings });
        } catch (e) {
            res.render("landing/index.ejs", { featuredListings: [] });
        }
    });

    // -------------------- API Route for Map Listings --------------------
    app.get("/api/listings", async (req, res) => {
        try {
            const listings = await Listing.find({}, "title price location country category geometry image rating");
            res.json(listings);
        } catch (err) {
            res.status(500).json({ error: "Failed to fetch map listings" });
        }
    });

    // -------------------- Listing Routes --------------------
    app.use("/listings", listingRouter);

    // -------------------- Booking Routes --------------------
    app.use("/", bookingRouter);

    // -------------------- Review Routes --------------------
    app.use("/listings/:id/reviews", reviewRouter);

    // -------------------- User Routes --------------------
    app.use("/", userRouter);

    // -------------------- 404 Route Handler --------------------
    app.use((req, res, next) => {
        next(new ExpressError(404, "Page Not Found"));
    });

    // -------------------- Global Error Handling Middleware --------------------
    app.use((err, req, res, next) => {
        let { statusCode = 500, message = "Something went wrong" } = err;
        res.status(statusCode).render("layouts/boilerplate.ejs", {
            body: `<div class="container py-5 text-center">
                    <h2 class="text-danger mb-3">Error ${statusCode}</h2>
                    <p class="lead text-secondary">${message}</p>
                    <a href="/listings" class="btn btn-dark mt-3">Return to Listings</a>
                   </div>`
        });
    });

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`);
    });
}).catch(err => {
    console.error("Critical: Could not connect to database:", err);
});