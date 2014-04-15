var browserify = require('browserify');
var fs = require('fs');

var b = browserify();

//b.add('./test.plask.js');
b.add('./examples/materials.TexturedFromFile.js');
b.transform({global:true}, 'brfs');
b.ignore('plask');
b.bundle().pipe(fs.createWriteStream('./examples/materials.TexturedFromFile.web.js'));
