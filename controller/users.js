const User = require("../models/user");
const sendWelcomeEmail = require("../utils/mailer");

module.exports.signUp = async(req, res) => {
    try {
        let { email, username, password, confirmPassword } = req.body;

        if (password !== confirmPassword) {
            req.flash("error", "Passwords do not match");
            return res.redirect("/signup");
        }

        if (password.length < 8) {
            req.flash("error", "Password must be at least 8 characters long");
            return res.redirect("/signup");
        }

        const newUser = new User({
            email,
            username,
        });

        const registeredUser = await User.register(newUser, password);

        try {
            await sendWelcomeEmail(email, username);
        } catch (err) {
            console.error(err);
        }

        req.login(registeredUser, (err) => {
            if (err) return next(err);

            req.flash("success", "Welcome to Haven Stay!");
            res.redirect("/listings");
        });

    } catch (err) {
        req.flash("error", err.message);
        res.redirect("/signup");
    }
};

module.exports.renderSignup = (req, res) => {
    res.render("users/signup.ejs");
}

module.exports.renderLogin = (req, res) => {
    res.render("users/login.ejs")
}

module.exports.login = async(req, res) => {
    req.flash("success", `Welcome Back ${req.body.username}`)
    const redirect = res.locals.redirectUrl || "/listings";
    res.redirect(redirect)
}

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "You are logged out!");
        res.redirect("/");
    });
}