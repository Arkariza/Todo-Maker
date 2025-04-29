const express = require("express");
const router = express.Router();
const taskController = require("../controllers/projectController");
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

const verifyBoardAccess = (req, res, next) => {
    const boardId = req.query.id_board;
    const userId = req.user.id;
    
    if (!boardId) {
        return res.redirect("/home");
    }
    
    const connection = require('../db');
    
    const sql = `
        SELECT b.* FROM board b
        LEFT JOIN shared_board_access s ON b.id_board = s.board_id AND s.user_id = ?
        WHERE b.id_board = ? AND (b.user_id = ? OR s.id IS NOT NULL)
    `;
    
    connection.query(sql, [userId, boardId, userId], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.redirect("/home");
        }
        
        if (results.length === 0) {
            return res.redirect("/home");
        }
        
        req.board = results[0];
        next();
    });
};

router.get("/task", checkAuth, verifyBoardAccess, (req, res) => {
    res.render("task", { username: req.user.username });
});

router.get("/home", (req, res) => {
    res.render("home", { username: req.user.username });
});

router.get("/lists/:id_board", taskController.getListsByBoard);
router.post("/lists", taskController.createList);
router.delete("/lists/:id_list", taskController.deleteList);
router.put("/lists/:id_list", taskController.updateList);

router.post("/tasks", taskController.createTask);
router.get("/tasks/:list_id", taskController.getTasksByList);
router.put("/tasks/:id_task", taskController.updateTask);
router.delete("/tasks/:id_task", taskController.deleteTask);

router.post("/tasks/add_user", taskController.addUserToBoard);
router.delete("/tasks/remove_user", taskController.removeUserFromBoard);

module.exports = router;