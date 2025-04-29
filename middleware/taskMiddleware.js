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