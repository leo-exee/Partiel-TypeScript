const express = require('express');
const bodyParser = require('body-parser');
const mustache = require('mustache');
const fs = require('fs');
const http = require('http');
const mustacheExpress = require('mustache-express');
const fileUpload = require('express-fileupload');

const path = require('path');
const { send } = require('express/lib/response');

const reflectMetaData = require('reflect-metadata');
const { createConnection } = require('typeorm');
const { getConnection } = require("typeorm");

const port = 3000;

let app = express();

//Connexion à la base de données
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

//Initalisation du file upload
app.use(fileUpload({
    limits: { filesSize: 50 * 1024 * 1024 },
    useTempFiles: true,
    tempFileDir: '/tmp/'
}));

//Initalisation des autres extensions
app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', __dirname + '/views');

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname)));

//Affichage du formulaire et des images déjà enregistré
app.get('/', async (req, res) => {


    const dbConnection = getConnection("dataBase");
    dbConnection.query(`SELECT * FROM "imgDatabase" WHERE id > 0;`, function (error, results, fields) {
        if (error) throw error;

        var data = results.rows.map((item) => { return { id: item.id, title: item.title, img: item.img, desc: item.desc } });
        
        res.render('index', { imgData: data });
    });
});

//Enregistrement de la nouvelle image
app.post('/send', async (req, res) => {

    //renommage de l'image pour éviter les doublons
    const dbConnection = getConnection("dataBase");
    dbConnection.query(`SELECT MAX(id) FROM "imgDatabase";`, function (error, results, fields) {
        if (error) throw error;
        req.files.img.name = 'img' + (results.rows[0].max + 1) + '.jpg';
        req.files.img.mv(`./img/${req.files.img.name}`, (err) => {
            if (err)
                return res.status(500).send(err);
        });

        //insertion en base de données
        const title = req.body.title;
        const desc = req.body.desc;
        const img = req.files.img.name;

        try {
            const dbConnection = getConnection("dataBase");

            dbConnection.query(`INSERT INTO "imgDatabase"(id, title, "desc", img) VALUES ((SELECT MAX(id) + 1 FROM "imgDatabase"), '${title}','${desc}','${img}');`, function (error, results, fields) { if (error) throw error; });
            res.redirect("/");
        } catch (e) {
            res.status(500).send("File not upload");
            console.log(e);
        }
        
    });

});

app.post('/removeImg', function (req, res) {
    try {
        const dbConnection = getConnection("dataBase");
        const id = req.body.id;
        try {
            fs.unlinkSync(`./img/img${id}.jpg`);
        } catch (err) {
            console.error(err)
        }
        dbConnection.query(`DELETE FROM "imgDatabase" WHERE id = ${id};`, function (error, results, fields) { if (error) throw error; });
        res.redirect("/");
    } catch (e) {
        res.status(500).send("File not removed");
        console.log(e);
    }
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});