const express = require("express");
const authController = require("../controllers/authController");
const router = express.Router();
const jwt = require("jsonwebtoken"); 
const SECRET_KEY = "your_secret_key";

router.get("/", (req, res) => {
    res.render("login");
});

router.get("/register", (req, res) => {
    res.render("register");
});

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh-token', authController.refreshToken);

const isAuthenticated = (req, res, next) => {
    if (!req.cookies) {
        console.log('Warning: req.cookies is undefined. Make sure cookie-parser is properly configured.');
        return res.redirect("/");
    }
    
    const token = req.cookies.token;
    
    if (!token) {
        return res.redirect("/");
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            if (req.cookies) {
                res.clearCookie("token");
                res.clearCookie("refreshToken");
            }
            return res.redirect("/");
        }

        req.user = decoded;
        next();
    });
};

router.get("/home", isAuthenticated, (req, res) => {
    res.render("home", { username: req.user.username });
});

router.get("/profile", isAuthenticated, (req, res) => {
    res.render("profile", { user: req.user });
});

module.exports = router;