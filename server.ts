const express = require('express');
const bodyParser = require('body-parser');
const mustache = require('mustache');
const fs = require('fs');
const axios = require('axios');
const http = require('http');
const mustacheExpress = require('mustache-express');
const fileUpload = require('express-fileupload');
const session = require('express-session');

const path = require('path');
const { send } = require('express/lib/response');

const reflectMetaData = require('reflect-metadata');
const { createConnection } = require('typeorm');
const { getConnection } = require("typeorm");

const passwordHash = require('password-hash');

const port = 3000;

let app = express();

const conn = async () => {
    try {
        const connection = await createConnection({
            name: "dataBase",
            type: "postgres",
            host: process.env.POSTGRES_HOST,
            port: 5432,
            username: "postgres",
            password: "lego2002",
            database: "appnode",
        });
    } catch (e) {
        console.log(e);
    }
};

conn();

app.use(fileUpload({
    limits: { filesSize: 50 * 1024 * 1024 },
    useTempFiles: true,
    tempFileDir: '/tmp/'
}));

app.set('trust proxy', 1)
app.use(session({
    secret: 'webtech2022',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false,
        expires: false,
        maxAge: 30 * 24 * 60 * 60 * 1000
    }
}))

app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', __dirname + '/views');

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname)));

app.get('/', async (req, res) => {


    const dbConnection = getConnection("dataBase");
    dbConnection.query(`SELECT title, "desc", img FROM "imgDatabase" WHERE id > 0;`, function (error, results, fields) {
        if (error) throw error;

        var data = results.rows.map((item) => { return { title: item.title, img: item.img, desc: item.desc } });
        
        res.render('index', { imgData: data });
    });
});

app.get('/sended', async (req, res) => {
    res.redirect('/')
});

app.post('/send', async (req, res) => {

    req.files.img.mv(`./img/${req.files.img.name}`, (err) => {
        if (err)
            return res.status(500).send(err);
    });

    const title = req.body.title;
    const desc = req.body.desc;
    const img = req.files.img.name;

    console.log(img);

    try {
        const dbConnection = getConnection("dataBase");

        dbConnection.query(`INSERT INTO "imgDatabase"(id, title, "desc", img) VALUES ((SELECT MAX(id) + 1 FROM "imgDatabase"), '${title}','${desc}','${img}');`, function (error, results, fields) { if (error) throw error; });
        res.redirect("/sended");
    } catch (e) {
        res.status(500).send("File not upload");
        console.log(e);
    }

});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});