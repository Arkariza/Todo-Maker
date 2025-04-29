const express = require("express");
const router = express.Router();
const projectController = require("../controllers/projectController");
const authController = require("../controllers/authController");
const jwt = require("jsonwebtoken");
const SECRET_KEY = "your_secret_key";

const checkAuth = (req, res, next) => {
    if (!req.cookies) {
        console.log('Warning: req.cookies is undefined. Make sure cookie-parser is properly configured.');
        return res.redirect("/");
    }
    
    const token = req.cookies.token;
    
    if (!token) {
        return res.redirect("/");
    }
    
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded;
        next();
    } catch (err) {
        if (req.cookies) {
            res.clearCookie("token");
            res.clearCookie("refreshToken");
        }
        return res.redirect("/");
    }
};

router.use(checkAuth);

router.get("/", (req, res) => {
    res.render("home", { username: req.user.username });
});

router.get("/kalender", (req, res) => {
    res.render("kalender", { username: req.user.username });
});

router.get('/board', projectController.getAllBoards);
router.post('/add_board', projectController.createBoard);
router.delete('/delete_board/:id', projectController.deleteBoard);
router.get('/board/shared', projectController.getSharedBoard);
router.get('/board/:id', projectController.getBoard);
router.put('/update_board/:id', projectController.updateBoard);
router.post('/logout', authController.logout);

module.exports = router;