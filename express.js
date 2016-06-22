"use strict";
var express = require('express');
var app = express();
var multer = require('multer');
var path = require('path');
var fs = require('fs');
var _ = require('underscore');
var Faced = require('faced');
var faced = new Faced();
var exec = require('child_process').exec
var helmetImg = __dirname + '/images/template/helmet-large-transparent-med.png';
//var outputImg = __dirname + '/images/output/composite.jpg';
var outputDir = __dirname + '/images/output/';
var upload = multer({dest: __dirname + '/images/input/', limits: {fileSize: 3000000}});
//limits: {fileSize: 5000000, files:1}

function nukeFile(filePath){
  fs.exists(filePath, function(exists) {
    if(exists) {
      fs.unlink(filePath);
    } else {
      console.error('Could not delete file '+filePath)
    }
  });
}

function wrapper(fileObj, callback){
  var file = fileObj.path;
  faced.detect(file, function(faces, image, file){
    if (!faces) {
      console.error("Could not open %s", file);
      callback('Error opening file')
      return
    }
    //convert images/adam.jpg \
    //images/helmet-large-transparent.png -geometry 64x64+128+128 -composite \
    //images/helmet-large-transparent.png -geometry 128x128+256+256 -composite \
    //images/helmet-large-transparent.png -geometry 256x256+100+400 -composite \
    //output.jpg
    var command = [];
    command.push('convert', file);//beginning of the command
    _.each(faces, function (face) {
      var faceWidth = face.getWidth();
      var faceHeight = face.getHeight();
      var offsetX = face.getX() - faceWidth*0.19;
      var offsetY = face.getY() - faceHeight*0.5;
      var helmetWidth = faceWidth*1.8;
      var helmetHeight = faceHeight*1.8;
      var geometry = helmetWidth+'x'+helmetHeight+'+'+offsetX+'+'+offsetY;
      command.push(helmetImg, '-geometry', geometry, '-composite');//push face composites onto command
    });//end each face
    var outputFile = outputDir + fileObj.filename + path.extname(fileObj.originalname)
    command.push('-resize','\'768>\'','-quality','85', outputFile); //tail end of command
    exec(command.join(' '), function(err, stdout, stderr) {
      if (err) {
        console.error(err);
        callback('Error processing file')
        return
      } else {
        callback(null, outputFile)
        return
      }
    });
  });
}

app.use(express.static('html'));
app.post('/image', upload.single('image'), function(req, res){
  if (!req.file){
    res.status(400).json({'message':'Invalid request'})
    return
  }
  if (req.file.mimetype.match(/image/i)){
    wrapper(req.file, function(err, result){
      if (err){
        res.status(500).json({'message':err})
        return
      } else {
        res.sendFile(result)
        nukeFile(result)//processed file
        nukeFile(req.file.path) //original file
        return
      }
    });
  } else {
    res.status(400).json({'message':'File must be of type image (jpg/gif/bmp/png)'})
    return
  }
});
app.listen(8080);
