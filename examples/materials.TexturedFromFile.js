var sys = require('pex-sys');
var glu = require('pex-glu');
var geom = require('pex-geom');
var materials = require('pex-materials');
var color = require('pex-color');

var Cube = geom.gen.Cube;
var Mesh = glu.Mesh;
var Textured = materials.Textured;
var PerspectiveCamera = glu.PerspectiveCamera;
var Arcball = glu.Arcball;
var Color = color.Color;
var Texture2D = glu.Texture2D;

sys.Window.create({
  settings: {
    width: 1280,
    height: 720,
    type: '3d',
    fullscreen: sys.Platform.isBrowser
  },
  init: function() {
    var cube = new Cube();
    cube.computeEdges();
    var tex = Texture2D.load('assets/test.png');
    var tex = Texture2D.load('assets/uffizi_cross_posx.jpg');
    this.mesh = new Mesh(cube, new Textured({ texture: tex }), { triangles: true });

    this.camera = new PerspectiveCamera(60, this.width / this.height);
    this.arcball = new Arcball(this, this.camera);
  },
  draw: function() {
    glu.clearColorAndDepth(Color.Black);
    glu.enableDepthWriteAndRead(true);
    this.mesh.draw(this.camera);
  }
});