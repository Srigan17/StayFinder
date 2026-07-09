const express = require("express");
const router = express.Router();
const { listingSchema } = require("../schemas.js");
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { isLoggedIn, listingAuthorization, validateListing } = require("../middleware.js");
const ListingController = require("../controller/listings.js");


const multer = require("multer");
const { storage } = require("../cloudconfig.js")
const upload = multer({ storage });


router.route("/")
    .get(
        wrapAsync(ListingController.index)
    )
    .post(
        isLoggedIn,
        upload.single("listing[image][url]"),
        validateListing,
        wrapAsync(ListingController.putNew)
    );

router.get(
    "/my-listings",
    isLoggedIn,
    wrapAsync(ListingController.myListings)
);


// -------------------- New Route (Form to Create Listing) --------------------

router.get("/new",
    isLoggedIn,
    ListingController.getNew
);



router.route("/:id")
    .get(
        wrapAsync(ListingController.showListing)
    )
    .put(
        isLoggedIn,
        listingAuthorization,
        upload.single("listing[image][url]"),
        validateListing,
        wrapAsync(ListingController.updateListing)
    )
    .delete(
        isLoggedIn,
        listingAuthorization,
        ListingController.deleteListing
    );




// -------------------- Edit Route (Form to Edit Listing) --------------------

router.get(
    "/:id/edit",
    isLoggedIn,
    listingAuthorization,
    wrapAsync(ListingController.getEdit)
);





module.exports = router;