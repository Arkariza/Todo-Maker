const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const path = require("path");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 5000;


const authRoutes = require("./routes/auth");
const homeRoutes = require("./routes/home");
const taskRoutes = require("./routes/task");
const registerRoutes = require("./routes/register");
const profileRoutes = require("./routes/profile");
const kalenderRoutes = require("./routes/kalender");

app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } 
}));

app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

app.use("/", authRoutes);
app.use("/", homeRoutes);
app.use("/", taskRoutes);
app.use("/", registerRoutes);
app.use("/", profileRoutes);
app.use("/", kalenderRoutes);

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});