/*jslint node: true, nomen: true*/
"use strict";

var path = require('path');
var _ = require('underscore');
var Faced = require('faced');
var faced = new Faced();
var exec = require('child_process').exec
var fs = require('fs')
  , gm = require('gm');
var helmetImg = 'images/helmet-large-transparent.png';

function worker(faces, image, file) {
    if (!faces) {
        console.error("Could not open %s", file);
        return;
    }
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
        //convert images/adam.jpg \
        //images/helmet-large-transparent.png -geometry 64x64+128+128 -composite \
        //images/helmet-large-transparent.png -geometry 128x128+256+256 -composite \
        //images/helmet-large-transparent.png -geometry 256x256+100+400 -composite \
        //output.jpg
        command.push(helmetImg, '-geometry', geometry, '-composite');//push face composites onto command
        console.log('found face, added to array')
    });//end each face
    command.push('-resize','\'768>\'','-quality','75','images/composite.jpg'); //tail end of command
    exec(command.join(' '), function(err, stdout, stderr) {
      if (err) console.log(err);
    });
}
_.each(process.argv.slice(2), function (file) {
    faced.detect(path.resolve(file), worker);
});
