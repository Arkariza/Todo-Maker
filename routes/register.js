const express = require("express");
const authController = require("../controllers/authController");
const router = express.Router();

router.get("/register", (_req, res) => {
    res.render("register", { error: null });
});
router.get("/", (_req, res) => {
    res.render("login", { error: null });
});

router.post('/register', authController.register);

module.exports = router;