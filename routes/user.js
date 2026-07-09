const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const Passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const userController = require("../controller/users.js");

router.route("/signup")
    .get(
        userController.renderSignup
    )
    .post(
        wrapAsync(userController.signUp)
    );



router.route("/login")
    .get(
        userController.renderLogin
    )
    .post(
        saveRedirectUrl,
        Passport.authenticate('local', {
            failureRedirect: '/login',
            failureFlash: true,
        }),
        userController.login
    )


router.get("/logout",
    userController.logout
);

module.exports = router;