var glu = require('pex-glu');
var color = require('pex-color');
var Context = glu.Context;
var Material = glu.Material;
var Program = glu.Program;
var Color = color.Color;
var extend = require('extend');
var fs = require('fs');

var SolidColorGLSL = fs.readFileSync(__dirname + '/SolidColor.glsl', 'utf8');

function SolidColor(uniforms) {
  this.gl = Context.currentContext;
  var program = new Program(SolidColorGLSL);
  var defaults = {
    color: Color.create(1, 1, 1, 1),
    pointSize: 1,
    premultiplied: 0
  };
  uniforms = extend(defaults, uniforms);
  Material.call(this, program, uniforms);
}

SolidColor.prototype = Object.create(Material.prototype);

module.exports = SolidColor;