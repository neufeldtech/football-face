var express = require('express');
var app = express();
var gm = require('gm');
var path = require('path');
var _ = require('underscore');
var Faced = require('faced');
var faced = new Faced();
var fs = require('fs');


  function worker(faces, image, file) {
      if (!faces) {
          console.error("Could not open %s", file);
          return;
      }
      _.each(faces, function (face) {
          var faceWidth = face.getWidth();
          var faceHeight = face.getHeight();
          gm('images/helmet-large-transparent.png')
            .resize(faceWidth*1.8, faceHeight*1.8)
            .write('/tmp/helmet-resized.png', function (err) {
              if (err){
                console.log(err)
              } else {
                var offsetX = face.getX() - faceWidth*0.15;
                var offsetY = face.getY() - faceHeight*0.5;
                gm(file)
                .composite('/tmp/helmet-resized.png')
                .geometry('+'+offsetX+'+'+offsetY)
                .write('images/composite.jpg', function(err) {
                  if(err) {
                    console.log(err)
                  } else {
                    console.log("Written composite image.");
                  }
                });
              }
          gm(req.files['profile-picture']['path'], 'img.jpg')
            .resize("100^", "100^")
            .gravity('Center')
            .crop(100, 100)
            .stream(function (err, stdout, stderr) {
       // do whatever you want with your output stream (stdout) here
    });
            });//end gm block
      });//end each
  }

app.get('/', function(req, res, next){

  gm('images/classphoto.jpg')
      .resize(50,50)
      .stream(function streamOut (err, stdout, stderr) {
          if (err) return next(err);
          stdout.pipe(res); //pipe to response
          stdout.on('error', next);
  });
});

app.listen(8080);
