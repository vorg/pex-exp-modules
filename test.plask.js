var sys = require('pex-sys');
var glu = require('pex-glu');
var geom = require('pex-geom');
var materials = require('pex-materials');
var color = require('pex-color');
var fx = require('pex-fx');

var Cube = geom.gen.Cube;
var Mesh = glu.Mesh;
var ShowNormals = materials.ShowNormals;
var PerspectiveCamera = glu.PerspectiveCamera;
var Arcball = glu.Arcball;
var Color = color.Color;

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
    this.mesh = new Mesh(cube, new ShowNormals(), { triangles: true });

    this.camera = new PerspectiveCamera(60, this.width / this.height);
    this.arcball = new Arcball(this, this.camera);
  },
  drawScene: function() {
    glu.clearColorAndDepth(Color.Red);
    glu.enableDepthReadAndWrite(true);
    this.mesh.draw(this.camera);
  },
  draw: function() {
    glu.clearColorAndDepth(Color.Black);
    var color = fx().render({ drawFunc: this.drawScene.bind(this), depth: true });
    var smaller = color.downsample4().downsample4().blur5().blur5();
    smaller.blit({ width: this.width, height: this.height });
  }
});