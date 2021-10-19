var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
var express = require('express');
var bodyParser = require('body-parser');
var mustache = require('mustache');
var fs = require('fs');
var axios = require('axios');
var http = require('http');
var mustacheExpress = require('mustache-express');
var fileUpload = require('express-fileupload');
var session = require('express-session');
var path = require('path');
var send = require('express/lib/response').send;
var reflectMetaData = require('reflect-metadata');
var createConnection = require('typeorm').createConnection;
var getConnection = require("typeorm").getConnection;
var passwordHash = require('password-hash');
var port = 3000;
var app = express();
var conn = function () { return __awaiter(_this, void 0, void 0, function () {
    var connection, e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, createConnection({
                        name: "dataBase",
                        type: "postgres",
                        host: process.env.POSTGRES_HOST,
                        port: 5432,
                        username: "postgres",
                        password: "lego2002",
                        database: "appnode"
                    })];
            case 1:
                connection = _a.sent();
                return [3 /*break*/, 3];
            case 2:
                e_1 = _a.sent();
                console.log(e_1);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
conn();
app.use(fileUpload({
    limits: { filesSize: 50 * 1024 * 1024 },
    useTempFiles: true,
    tempFileDir: '/tmp/'
}));
app.set('trust proxy', 1);
app.use(session({
    secret: 'webtech2022',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false,
        expires: false,
        maxAge: 30 * 24 * 60 * 60 * 1000
    }
}));
app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', __dirname + '/views');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname)));
app.get('/', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var dbConnection;
    return __generator(this, function (_a) {
        dbConnection = getConnection("dataBase");
        dbConnection.query("SELECT title, \"desc\", img FROM \"imgDatabase\" WHERE id > 0;", function (error, results, fields) {
            if (error)
                throw error;
            var data = results.rows.map(function (item) { return { title: item.title, img: item.img, desc: item.desc }; });
            res.render('index', { imgData: data });
        });
        return [2 /*return*/];
    });
}); });
app.get('/sended', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    return __generator(this, function (_a) {
        res.redirect('/');
        return [2 /*return*/];
    });
}); });
app.post('/send', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var title, desc, img, dbConnection;
    return __generator(this, function (_a) {
        req.files.img.mv("./img/" + req.files.img.name, function (err) {
            if (err)
                return res.status(500).send(err);
        });
        title = req.body.title;
        desc = req.body.desc;
        img = req.files.img.name;
        console.log(img);
        try {
            dbConnection = getConnection("dataBase");
            dbConnection.query("INSERT INTO \"imgDatabase\"(id, title, \"desc\", img) VALUES ((SELECT MAX(id) + 1 FROM \"imgDatabase\"), '" + title + "','" + desc + "','" + img + "');", function (error, results, fields) { if (error)
                throw error; });
            res.redirect("/sended");
        }
        catch (e) {
            res.status(500).send("File not upload");
            console.log(e);
        }
        return [2 /*return*/];
    });
}); });
app.listen(port, function () {
    console.log("Example app listening at http://localhost:" + port);
});
