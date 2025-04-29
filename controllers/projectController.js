const connection = require('../db');

exports.getAllBoards = (req, res) => {
    const userId = req.user.id;
    
    const sql = `
        SELECT 
            b.*,
            SUM(CASE WHEN t.status = 'on progress' THEN 1 ELSE 0 END) as ongoing_count,
            SUM(CASE WHEN t.status = 'done' THEN 1 ELSE 0 END) as done_count
        FROM board b
        LEFT JOIN list l ON b.id_board = l.board_id
        LEFT JOIN task t ON l.id_list = t.list_id
        WHERE b.user_id = ?
        GROUP BY b.id_board
        ORDER BY b.created_at DESC
    `;
    
    connection.query(sql, [userId], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Failed to fetch boards" });
        }
        
        res.json({ data: results });
    });
};

exports.createBoard = (req, res) => {
    const { title } = req.body;
    const userId = req.user.id;

    if (!title || title.trim() === "") {
        return res.status(400).json({ error: "Board title is required" });
    }

    const create_at = new Date();

    const sql = `
        INSERT INTO board (title, user_id, created_at)
        VALUES (?, ?, ?, ?, ?)
    `;

    connection.query(
        sql,
        [title, userId, create_at],
        (err, result) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ error: "Failed to create board" });
            }

            const boardId = result.insertId;
            const defaultLists = ["To-do", "Doing", "Done"];
            const insertListSql = "INSERT INTO list (board_id, title) VALUES ?";
            const listValues = defaultLists.map(title => [boardId, title]);

            connection.query(insertListSql, [listValues], (listErr) => {
                if (listErr) {
                    console.error("Error creating default lists:", listErr);
                    return res.status(500).json({ error: "Board created but failed to create default lists" });
                }

                res.status(201).json({
                    id_board: boardId,
                    title,
                    user_id: userId,
                    create_at,
                    created_at: create_at.toISOString(),
                    default_lists: defaultLists
                });
            });
        }
    );
};

exports.deleteBoard = (req, res) => {
    const boardId = req.params.id;
    const userId = req.user.id;
    
    const checkSql = "SELECT * FROM board WHERE id_board = ? AND user_id = ?";
    
    connection.query(checkSql, [boardId, userId], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Database error" });
        }
        
        if (results.length === 0) {
            return res.status(403).json({ error: "You don't have permission to delete this board" });
        }
        const deleteSql = "DELETE FROM board WHERE id_board = ?";
        
        connection.query(deleteSql, [boardId], (err, result) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ error: "Failed to delete board" });
            }
            
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: "Board not found" });
            }
            
            res.json({ success: true, message: "Board deleted successfully" });
        });
    });
};

exports.updateBoard = (req, res) => {
    const boardId = req.params.id;
    const { title } = req.body;
    const userId = req.user.id;
    
    if (!title || title.trim() === "") {
        return res.status(400).json({ error: "Board title is required" });
    }
    const checkSql = "SELECT * FROM board WHERE id_board = ? AND user_id = ?";
    
    connection.query(checkSql, [boardId, userId], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Database error" });
        }
        
        if (results.length === 0) {
            return res.status(403).json({ error: "You don't have permission to update this board" });
        }
        const updateSql = "UPDATE board SET title = ? WHERE id_board = ?";
        
        connection.query(updateSql, [title, boardId], (err, result) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ error: "Failed to update board" });
            }
            
            res.json({ success: true, message: "Board updated successfully" });
        });
    });
};


exports.getListsByBoard = (req, res) => {
    const { id_board } = req.params;

    connection.query("SELECT * FROM list WHERE board_id = ?", [id_board], (err, results) => {
        if (err) return res.status(500).json({ error: "Database error: " + err.message });
        res.json({ success: true, data: results });
    });
};

exports.createList = (req, res) => {
    const { id_board, title } = req.body;
    if (!id_board || !title) return res.status(400).json({ error: "Board ID and title are required" });

    connection.query("INSERT INTO list (board_id, title) VALUES (?, ?)", [id_board, title], (err, result) => {
        if (err) return res.status(500).json({ error: "Database error: " + err.message });

        res.json({ success: true, message: "List created successfully", listId: result.insertId });
    });
};

exports.deleteList = (req, res) => {
    const { id_list } = req.params;

    connection.query("DELETE FROM list WHERE id_list = ?", [id_list], (err, result) => {
        if (err) return res.status(500).json({ error: "Database error: " + err.message });

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "List not found" });
        }

        res.json({ success: true, message: "List deleted successfully" });
    });
};

exports.getTasksByList = (req, res) => {
    let list_id = req.params.list_id;

    list_id = parseInt(list_id);

    console.log("List ID yang diterima:", list_id);

    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');

    connection.query(
        `SELECT * FROM task WHERE list_id = ?`,
        [list_id],
        (err, results) => {
            if (err) {
                console.error("Query error:", err);
                return res.status(500).json({ error: "Database error: " + err.message });
            }

            console.log("Hasil query:", results);
            res.json({ success: true, tasks: results });
        }
    );
};



exports.createTask = (req, res) => {
    const { list_id, title, description, priority, label, deadline, status } = req.body;
    const assignee_id = req.user.id;

    if (!list_id || !title) {
        return res.status(400).json({ error: "List ID and title are required" });
    }

    connection.query(
        `INSERT INTO task 
        (list_id, title, description, priority, label, assignee_id, deadline, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            list_id, title, description || null, priority || 'Medium', label || null, assignee_id, deadline || null, status || 'on progress'
        ],
        (err, result) => {
            if (err) return res.status(500).json({ error: "Database error: " + err.message });

            res.json({ success: true, message: "Task created successfully", id_task: result.insertId });
        }
    );
};


exports.updateTask = (req, res) => {
    const { id_task } = req.params;
    const { list_id, title, description, priority, label, deadline, status } = req.body;
    const assignee_id = req.user?.id;

    if (!id_task) return res.status(400).json({ error: "Task ID is required" });

    let sqlParts = [];
    let params = [];

    if (title !== undefined) {
        sqlParts.push("title = ?");
        params.push(title);
    }

    if (description !== undefined) {
        sqlParts.push("description = ?");
        params.push(description);
    }

    if (priority !== undefined) {
        sqlParts.push("priority = ?");
        params.push(priority);
    }

    if (label !== undefined) {
        sqlParts.push("label = ?");
        params.push(label);
    }

    if (list_id !== undefined) {
        sqlParts.push("list_id = ?");
        params.push(list_id);
    }

    if (assignee_id !== undefined) {
        sqlParts.push("assignee_id = ?");
        params.push(assignee_id);
    }

    if (deadline !== undefined) {
        sqlParts.push("deadline = ?");
        params.push(deadline);
    }

    if (status !== undefined) {
        sqlParts.push("status = ?");
        params.push(status);
    }

    if (sqlParts.length === 0) {
        return res.status(400).json({ error: "No fields to update" });
    }

    params.push(id_task); 

    const sql = `UPDATE task SET ${sqlParts.join(", ")} WHERE id_task = ?`;

    connection.query(sql, params, (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Database error: " + err.message });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Task not found" });
        }

        res.json({ success: true, message: "Task updated successfully" });
    });
};


exports.deleteTask = (req, res) => {
    const { id_task } = req.params;

    if (!id_task) {
        return res.status(400).json({ error: "Task ID is required" });
    }

    connection.query("DELETE FROM task WHERE id_task = ?", [id_task], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Database error: " + err.message });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Task not found" });
        }

        res.json({ success: true, message: "Task deleted successfully" });
    });
};

exports.updateList = (req, res) => {
    const { id_list } = req.params;
    const { title } = req.body;
    
    if (!title || title.trim() === "") {
        return res.status(400).json({ error: "List title is required" });
    }
    
    const checkSql = `
        SELECT l.* FROM list l
        JOIN board b ON l.board_id = b.id_board
        WHERE l.id_list = ? AND b.user_id = ?
    `;
    
    connection.query(checkSql, [id_list, req.user.id], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Database error" });
        }
        
        if (results.length === 0) {
            return res.status(403).json({ error: "You don't have permission to update this list" });
        }
        
        const updateSql = "UPDATE list SET title = ? WHERE id_list = ?";
        
        connection.query(updateSql, [title, id_list], (err, result) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ error: "Failed to update list" });
            }
            
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: "List not found" });
            }
            
            res.json({ success: true, message: "List updated successfully" });
        });
    });
};


exports.getBoard = (req, res) => {
    const boardId = req.params.id;
    const userId = req.user.id;
    
    const sql = `
        SELECT b.* FROM board b
        LEFT JOIN shared_board_access s ON b.id_board = s.board_id AND s.user_id = ?
        WHERE b.id_board = ? AND (b.user_id = ? OR s.id IS NOT NULL)
    `;
    
    connection.query(sql, [userId, boardId, userId], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Database error" });
        }
        
        if (results.length === 0) {
            return res.status(403).json({ error: "You don't have permission to view this board" });
        }
        
        res.json({ data: results[0] });
    });
};

exports.addUserToBoard = (req, res) => {
    const { board_id, username } = req.body;

    if (!board_id || !username) {
        return res.status(400).json({ error: "Board ID dan Username wajib diisi" });
    }

    const findUserSql = "SELECT id FROM user WHERE username = ?";
    connection.query(findUserSql, [username], (err, userResults) => {
        if (err) return res.status(500).json({ error: "Database error: " + err.message });

        if (userResults.length === 0) {
            return res.status(404).json({ error: "User tidak ditemukan" });
        }

        const user_id = userResults[0].id;

        const checkSql = "SELECT * FROM shared_board_access WHERE board_id = ? AND user_id = ?";
        connection.query(checkSql, [board_id, user_id], (err, results) => {
            if (err) return res.status(500).json({ error: "Database error: " + err.message });

            if (results.length > 0) {
                return res.status(400).json({ error: "User sudah ada di board ini" });
            }

            const insertSql = "INSERT INTO shared_board_access (board_id, user_id) VALUES (?, ?)";
            connection.query(insertSql, [board_id, user_id], (err, result) => {
                if (err) return res.status(500).json({ error: "Database error: " + err.message });

                res.json({ success: true, message: `User ${username} berhasil ditambahkan ke board` });
            });
        });
    });
};

exports.removeUserFromBoard = (req, res) => {
    const { board_id, user_id } = req.body;

    if (!board_id || !user_id) {
        return res.status(400).json({ error: "Board ID dan User ID wajib diisi" });
    }

    const deleteSql = "DELETE FROM shared_board_access WHERE board_id = ? AND user_id = ?";
    connection.query(deleteSql, [board_id, user_id], (err, result) => {
        if (err) return res.status(500).json({ error: "Database error: " + err.message });

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "User tidak ditemukan di board ini" });
        }

        res.json({ success: true, message: "User berhasil dihapus dari board" });
    });
};

exports.getSharedBoard = (req, res) => {
    const userId = req.user.id;

    const sql = `
        SELECT DISTINCT b.*,
            SUM(CASE WHEN t.status = 'on progress' THEN 1 ELSE 0 END) as ongoing_count,
            SUM(CASE WHEN t.status = 'done' THEN 1 ELSE 0 END) as done_count
        FROM board b
        JOIN shared_board_access s ON b.id_board = s.board_id
        LEFT JOIN list l ON b.id_board = l.board_id
        LEFT JOIN task t ON l.id_list = t.list_id
        WHERE s.user_id = ?
        GROUP BY b.id_board
    `;

    connection.query(sql, [userId], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Database error" });
        }

        console.log("Shared boards query results:", results);

        res.json({ data: results });
    });
};

exports.getAllTasksForCalendar = (req, res) => {
    const userId = req.user.id;
    
    const sql = `
        SELECT l.id_list, l.board_id, b.title as board_title, l.title as list_title
        FROM list l
        JOIN board b ON l.board_id = b.id_board
        WHERE b.user_id = ? OR b.id_board IN (
            SELECT board_id FROM shared_board_access WHERE user_id = ?
        )
    `;
    
    connection.query(sql, [userId, userId], (err, lists) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Failed to fetch lists" });
        }
        
        if (lists.length === 0) {
            return res.json({ tasks: [] });
        }
        
        const listIds = lists.map(list => list.id_list);
        const placeholders = listIds.map(() => '?').join(',');
        
        const taskSql = `
            SELECT t.*, l.board_id
            FROM task t
            JOIN list l ON t.list_id = l.id_list
            WHERE t.list_id IN (${placeholders})
        `;
        
        connection.query(taskSql, listIds, (err, tasks) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ error: "Failed to fetch tasks" });
            }
            
            const tasksWithBoardInfo = tasks.map(task => {
                const list = lists.find(l => l.id_list === task.list_id);
                return {
                    ...task,
                    board_id: list.board_id,
                    board_title: list.board_title,
                    list_title: list.list_title
                };
            });
            
            res.json({ tasks: tasksWithBoardInfo });
        });
    });
};

exports.getTasksWithBoardInfo = (req, res) => {
    const listId = req.params.list_id;
    
    const sql = `
        SELECT t.*, l.board_id
        FROM task t
        JOIN list l ON t.list_id = l.id_list
        WHERE t.list_id = ?
    `;
    
    connection.query(sql, [listId], (err, tasks) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Failed to fetch tasks" });
        }
        
        res.json({ tasks });
    });
};