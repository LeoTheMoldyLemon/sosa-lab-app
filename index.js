const fs = require("fs");
const express = require("express");
const config = require("./config.json");
const createDB = require("./db.js");
const crypto = require("node:crypto");
const cookieParser = require("cookie-parser");
const path = require("node:path");
let sequelize;

const helmet = require("helmet");

async function createSession(user) {
    const sessionId = crypto.randomBytes(3 * 4).toString("base64"); // nasumično generiraj session ID
    const session = await sequelize.models.Session.create({
        id: sessionId.toString(),
        userId: user.id.toString(),
    }); // stvori session u bazi podataka
    return session;
}

// Stvori Hash od nekog podatka
function hash(data) {
    return crypto.createHash("sha256").update(data).digest("base64");
}

async function startServer() {
    const app = express();

    app.use(helmet());
    app.disable("x-powered-by");
    app.use(express.static("static", { index: false }));
    app.use(express.json());
    app.use(express.urlencoded());
    app.use(cookieParser());

    //Prije middleware-a koji provjerava za session stavljamo zahtjeve za koje nije potreban aktivan session
    app.get("/login", (req, res) => {
        res.sendFile("./static/login.html", { root: __dirname });
    });
    app.get("/register", (req, res) => {
        res.sendFile("./static/register.html", { root: __dirname });
    });

    app.post("/login", async (req, res) => {
        const passwordHash = hash(req.body.password);
        const user = await sequelize.models.User.findOne({
            where: { name: req.body.name.toString(), password: passwordHash.toString() },
        });
        if (!user) return res.status(401).end();
        const session = await createSession(user);
        res.cookie("session", session.id, { secure: false }); // postavi session ID kao cookie
        res.redirect(301, "/"); // vrati korisnika na početnu stranicu
    });

    app.post("/register", async (req, res) => {
        if (typeof req.body.name != "string" || typeof req.body.password != "string")
            res.status(400).end();

        const passwordHash = hash(req.body.password);
        const user = await sequelize.models.User.create({
            name: req.body.name.toString(),
            password: passwordHash.toString(),
        });
        const session = await createSession(user);
        res.cookie("session", session.id, { secure: false }); // postavi session ID kao cookie
        res.redirect(301, "/");
    });

    //Middleware za session
    app.use(async (req, res, next) => {
        if (!req.cookies.session) return res.redirect("/login"); //ako nema session cookie, pošalji na login

        const session = await sequelize.models.Session.findOne({
            where: { id: req.cookies.session.toString() },
        });
        if (!session) return res.redirect("/login"); //ako session cookie nije u bazi podataka odi na login

        const user = await sequelize.models.User.findOne({
            where: { id: session.userId },
        });
        if (!user) return res.redirect("/login"); //ako korisnik s tim session-om nekako ne postoji, odi na login

        req.user = user; //postavljamo req.user koji sada mozemo koristiti ubuduce za informacije o korisniku
        next();
    });

    app.get("/", (req, res) => {
        res.sendFile("./static/index.html", { root: __dirname });
    });

    app.get("/add", (req, res) => {
        res.sendFile("./static/addNote.html", { root: __dirname });
    });

    app.get("/notes", async (req, res) => {
        const results = await sequelize.models.Note.findAll({
            where: { userId: req.user.id.toString() },
        });
        res.json(results);
    });

    app.post("/note", async (req, res) => {
        try {
            await sequelize.query(`INSERT INTO Notes (name, text, userId) VALUES (?,?,?);`, {
                replacements: [req.body.name, req.body.text, req.user.id],
            });
        } catch (err) {
            res.status(500).end();
            return;
        }
        res.redirect(301, "/add");
    });

    app.get("/name", async (req, res) => {
        res.send(req.user.name);
    });

    app.listen(config.PORT, () => console.log(`Server running.`));
    return app;
}

async function main() {
    sequelize = await createDB();
    startServer();
}
main();
