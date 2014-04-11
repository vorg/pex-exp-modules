var sys = require('pex-sys');
var glu = require('pex-glu');

sys.Window.create({
  settings: {
    width: 1280,
    height: 720,
    type: '3d'
  },
  init: function() {
    console.log('Context', glu.Context.currentContext);
  },
  draw: function() {
    this.gl.clearColor(1, 0, 0, 1);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
  }
});