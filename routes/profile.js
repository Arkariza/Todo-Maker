const express = require("express");
const router = express.Router();

router.get("/profile", (req, res) => {
    res.render("profile", { username: req.query.username });
});

module.exports = router