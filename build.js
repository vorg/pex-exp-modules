var browserify = require('browserify');
var fs = require('fs');

var b = browserify();

//b.add('./test.plask.js');
b.add('./node_modules/pex-materials/lib/SolidColor.js');
b.transform('brfs');
b.ignore('plask');
b.bundle().pipe(fs.createWriteStream('./test.browser.js'));
