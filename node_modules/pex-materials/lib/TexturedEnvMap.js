var glu = require('pex-glu');
var color = require('pex-color');
var Context = glu.Context;
var Material = glu.Material;
var Program = glu.Program;
var Color = color.Color;
var extend = require('extend');
var fs = require('fs');

var TexturedEnvMapGLSL = fs.readFileSync(__dirname + '/TexturedEnvMap.glsl', 'utf8');

function TexturedEnvMap(uniforms) {
  this.gl = Context.currentContext;
  var program = new Program(TexturedEnvMapGLSL);
  var defaults = {};
  uniforms = extend(defaults, uniforms);
  Material.call(this, program, uniforms);
}

TexturedEnvMap.prototype = Object.create(Material.prototype);

module.exports = TexturedEnvMap;
