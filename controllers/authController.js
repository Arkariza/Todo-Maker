const connection = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const SECRET_KEY = "your_secret_key";
const REFRESH_SECRET = "your_refresh_secret_key";

exports.register = (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.render("register", { error: "Username dan password harus diisi!" });
    }

    connection.query("SELECT * FROM user WHERE username = ?", [username], async (err, results) => {
        if (err) {
            return res.render("register", { error: "Terjadi kesalahan pada server." });
        }

        if (results.length > 0) {
            return res.render("register", { error: "Username sudah digunakan." });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = "INSERT INTO user (username, password) VALUES (?, ?)";
        connection.query(sql, [username, hashedPassword], (err) => {
            if (err) {
                return res.render("register", { error: "Gagal menyimpan data pengguna." });
            }
            res.redirect("/");
        });
    });
}; 

exports.login = (req, res) => {
    const { username, password } = req.body;

    const sql = "SELECT * FROM user WHERE username = ?";
    connection.query(sql, [username], (err, results) => {
        if (err) return res.status(500).send("Server error");
        if (results.length === 0) {
            return res.status(400).json({ error: "Username atau password salah" });
        }

        const user = results[0];
        bcrypt.compare(password, user.password, async (err, isMatch) => {
            if (err) return res.status(500).send("Error saat cek password");
            if (!isMatch) return res.status(400).json({ error: "Password salah" });
            
            const accessToken = jwt.sign(
                { id: user.id, username: user.username }, 
                SECRET_KEY, 
                { expiresIn: '15m' }
            );
            
            const refreshToken = jwt.sign(
                { id: user.id, username: user.username }, 
                REFRESH_SECRET,
                { expiresIn: '7d' }
            );
            
            connection.query("UPDATE user SET refresh_token = ? WHERE id = ?", [refreshToken, user.id], (updateErr) => {
                if (updateErr) return res.status(500).send("Error saat update refresh token");
                
                res.cookie("token", accessToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production', 
                    maxAge: 15 * 60 * 1000 
                });
                
                res.cookie("refreshToken", refreshToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    maxAge: 7 * 24 * 60 * 60 * 1000 
                });

                res.redirect("/home");
            });
        });
    });
};

exports.logout = (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        res.clearCookie("token");
        res.clearCookie("refreshToken");
        return res.redirect("/");
    }
    
    const sql = "UPDATE user SET refresh_token = NULL WHERE refresh_token = ?";
    connection.query(sql, [refreshToken], (err, result) => {
        if (err) return res.status(500).json({ error: "Gagal logout" });
        
        res.clearCookie("token");
        res.clearCookie("refreshToken");
        
        return res.redirect("/");
    });
};

exports.refreshToken = (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(400).json({ error: 'Refresh token diperlukan' });
    }

    jwt.verify(refreshToken, REFRESH_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Refresh token tidak valid' });
        }
        
        const newAccessToken = jwt.sign(
            { id: user.id, username: user.username }, 
            SECRET_KEY, 
            { expiresIn: '15m' }
        );

        res.cookie("token", newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 15 * 60 * 1000 
        });

        res.json({ success: true, message: 'Token refreshed successfully' });
    });
};

exports.verifyToken = (req, res, next) => {
    const token = req.cookies.token;
    
    if (!token) {
        return res.status(401).redirect("/");
    }
    
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(403).redirect("/");
        }
        
        req.user = decoded;
        next();
    });
};