/*jslint node: true, nomen: true*/
"use strict";

var path = require('path');
var _ = require('underscore');
var Faced = require('faced');
var faced = new Faced();
var fs = require('fs')
  , gm = require('gm');


function worker(faces, image, file) {
    var output, colors = {
        "face": [0, 0, 0],
        "mouth": [255, 0, 0],
        "nose": [255, 255, 255],
        "eyeLeft": [0, 0, 255],
        "eyeRight": [0, 255, 0]
    };

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
          });
    });
}

_.each(process.argv.slice(2), function (file) {
    faced.detect(path.resolve(file), worker);

});
