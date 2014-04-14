var glu = require('pex-glu');
var color = require('pex-color');
var Context = glu.Context;
var Material = glu.Material;
var Program = glu.Program;
var Color = color.Color;
var merge = require('merge');
var fs = require('fs');

var TexturedGLSL = fs.readFileSync(__dirname + '/Textured.glsl', 'utf8');

function Textured(uniforms) {
  this.gl = Context.currentContext;
  var program = new Program(TexturedGLSL);
  var defaults = {};
  uniforms = merge(defaults, uniforms);
  Material.call(this, program, uniforms);
}

Textured.prototype = Object.create(Material.prototype);

module.exports = Textured;
