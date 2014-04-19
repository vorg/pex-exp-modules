var glu = require('pex-glu');
var color = require('pex-color');
var geom = require('pex-geom');
var Context = glu.Context;
var Material = glu.Material;
var Program = glu.Program;
var Color = color.Color;
var Vec2 = geom.Vec2;
var extend = require('extend');
var fs = require('fs');

var TexturedGLSL = fs.readFileSync(__dirname + '/Textured.glsl', 'utf8');

function Textured(uniforms) {
  this.gl = Context.currentContext;
  var program = new Program(TexturedGLSL);
  var defaults = {
    scale: new Vec2(1, 1)
  };
  uniforms = extend(defaults, uniforms);
  Material.call(this, program, uniforms);
}

Textured.prototype = Object.create(Material.prototype);

module.exports = Textured;
