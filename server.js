//imports
const express = require("express");
const mongoose = require("mongoose");
const mongodb = require("mongodb");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const multer = require("multer");

//instantiate express server
const app = express();

//load .env
dotenv.config();

//start multer
const upload = multer();

//setup database connection
mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => console.log("Connection to mongoDB Successful!"));
const fileSchema = new mongoose.Schema({
    name: String,
    file: Buffer,
    size: Number
});
const File = mongoose.model("File", fileSchema);

//mount middleware
app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname + "/public")));

//mount paths
app.get("/", (req, res) => res.sendFile(path.join(__dirname + "/view/index.html")));
app.post("/api/fileanalyse", upload.single("upfile"), (req, res) => {
    const newFile = new File({
        name: req.file.originalname,
        file: req.file.buffer,
        size: req.file.size
    });
    newFile.save((err, data) => {
        if (err) return console.log(err);
        res.json({
            fileName: data.name,
            fileId: data._id,
            size: data.size
        });
    });
});

//start server
const port = process.env.PORT | 3000;
app.listen(port, () => console.log("Server is listening on port: " + port));