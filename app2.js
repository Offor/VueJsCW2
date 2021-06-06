var express = require("express");
var path = require("path");
var http = require("http");
const { response } = require("express");
var fs = require('fs');
var app = express();

app.use((req, res, next) => {
    var filePath = path.join(__dirname, "static");
    fs.stat(filePath, function(err, fileInfo) {
        if(err) {
            next();
            return;
        }else if (fileInfo.isFile()) {
            res.sendFile(filePath);
        } 
        else {
            next();
        }
    });
});

app.use(function(req, res) {
    res.status(404);
    res.send("FIle not found")
});
// //sets up the path where your static files are
// var publicPath = path.resolve(__dirname, "public");
// var imagePath = path.resolve(__dirname, "images");

// //sends static files from the public path directory
// app.use('/public', express.static(publicPath));
// app.use('/images', express.static(imagePath));
// app.use(function(request, response,next) {
//     response.writeHead(200, {"Content-Type": "text/plain"});
//     response.end("Looks like you didn't find a static file.");
//     next();
// });

http.createServer(app).listen(3000);