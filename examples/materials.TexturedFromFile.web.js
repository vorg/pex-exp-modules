(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
},{"pex-color":5,"pex-geom":7,"pex-glu":17,"pex-materials":33,"pex-sys":40}],2:[function(require,module,exports){

},{}],3:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.once = noop;
process.off = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],4:[function(require,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};


exports.basename = function(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPath(path)[3];
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

}).call(this,require("/Users/vorg/Workspace/vorg-pex/experiments/v3/pex-exp-modules/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js"))
},{"/Users/vorg/Workspace/vorg-pex/experiments/v3/pex-exp-modules/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js":3}],5:[function(require,module,exports){
module.exports.Color = require('./lib/Color')
},{"./lib/Color":6}],6:[function(require,module,exports){
// Generated by CoffeeScript 1.7.1
var Color, clamp;

clamp = function(value, min, max) {
  return Math.max(min, Math.min(value, max));
};

Color = (function() {
  Color.prototype.r = 0;

  Color.prototype.g = 0;

  Color.prototype.b = 0;

  Color.prototype.a = 0;

  function Color(r, g, b, a) {
    this.r = r != null ? r : 0;
    this.g = g != null ? g : 0;
    this.b = b != null ? b : 0;
    this.a = a != null ? a : 0;
  }

  Color.create = function(r, g, b, a) {
    return new Color(r, g, b, a);
  };

  Color.createHSV = function(h, s, v) {
    var c;
    c = new Color();
    c.setHSV(h, s, v);
    return c;
  };

  Color.prototype.set = function(r, g, b, a) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
    if (a == null) {
      this.a = 1;
    }
    return this;
  };

  Color.prototype.hash = function() {
    return 1 * this.r + 12 * this.g + 123 * this.b + 1234 * this.a;
  };

  Color.prototype.setHSV = function(h, s, v) {
    var b, g, h6, r;
    h6 = h * 6.0;
    r = clamp(h6 - 4.0, 0.0, 1.0) - clamp(h6 - 1.0, 0.0, 1.0) + 1.0;
    g = clamp(h6, 0.0, 1.0) - clamp(h6 - 3.0, 0.0, 1.0);
    b = clamp(h6 - 2.0, 0.0, 1.0) - clamp(h6 - 5.0, 0.0, 1.0);
    this.r = r * v * s + (v * (1.0 - s));
    this.g = g * v * s + (v * (1.0 - s));
    this.b = b * v * s + (v * (1.0 - s));
    return this;
  };

  Color.prototype.copy = function(c) {
    this.r = c.r;
    this.g = c.g;
    this.b = c.b;
    this.a = c.a;
    return this;
  };

  Color.prototype.clone = function(c) {
    return new Color(this.r, this.g, this.b, this.a);
  };

  return Color;

})();

Color.Transparent = new Color(0, 0, 0, 0);

Color.None = new Color(0, 0, 0, 0);

Color.Black = new Color(0, 0, 0, 1);

Color.White = new Color(1, 1, 1, 1);

Color.Grey = new Color(0.5, 0.5, 0.5, 1);

Color.Red = new Color(1, 0, 0, 1);

Color.Green = new Color(0, 1, 0, 1);

Color.Blue = new Color(0, 0, 1, 1);

Color.Yellow = new Color(1, 1, 0, 1);

Color.Pink = new Color(1, 0, 1, 1);

Color.Cyan = new Color(0, 1, 1, 1);

Color.Orange = new Color(1, 0.5, 0, 1);

module.exports = Color;

},{}],7:[function(require,module,exports){
module.exports.Vec2 = require('./lib/Vec2');
module.exports.Vec3 = require('./lib/Vec3');
module.exports.Vec4 = require('./lib/Vec4');
module.exports.Mat4 = require('./lib/Mat4');
module.exports.Quat = require('./lib/Quat');
module.exports.Ray = require('./lib/Ray');
module.exports.Geometry = require('./lib/Geometry');
module.exports.gen = {
  Cube: require('./lib/gen/Cube'),
  Sphere: require('./lib/gen/Sphere')
}
},{"./lib/Geometry":8,"./lib/Mat4":9,"./lib/Quat":10,"./lib/Ray":11,"./lib/Vec2":12,"./lib/Vec3":13,"./lib/Vec4":14,"./lib/gen/Cube":15,"./lib/gen/Sphere":16}],8:[function(require,module,exports){
// Generated by CoffeeScript 1.7.1
var Geometry, Vec2, Vec3, Vec4;

Vec2 = require('./Vec2');

Vec3 = require('./Vec3');

Vec4 = require('./Vec4');

Geometry = (function() {
  function Geometry(_arg) {
    var colors, edges, faces, indices, normals, tangents, texCoords, vertices;
    vertices = _arg.vertices, normals = _arg.normals, texCoords = _arg.texCoords, tangents = _arg.tangents, colors = _arg.colors, indices = _arg.indices, edges = _arg.edges, faces = _arg.faces;
    if (vertices == null) {
      vertices = true;
    }
    if (normals == null) {
      normals = false;
    }
    if (texCoords == null) {
      texCoords = false;
    }
    if (tangents == null) {
      tangents = false;
    }
    if (colors == null) {
      colors = false;
    }
    if (indices == null) {
      indices = false;
    }
    if (edges == null) {
      edges = false;
    }
    if (faces == null) {
      faces = true;
    }
    this.attribs = {};
    if (vertices) {
      this.addAttrib('vertices', 'position', vertices, false);
    }
    if (normals) {
      this.addAttrib('normals', 'normal', normals, false);
    }
    if (texCoords) {
      this.addAttrib('texCoords', 'texCoord', texCoords, false);
    }
    if (tangents) {
      this.addAttrib('tangents', 'tangent', tangents, false);
    }
    if (colors) {
      this.addAttrib('colors', 'color', colors, false);
    }
    if (indices) {
      this.addIndices(indices);
    }
    if (edges) {
      this.addEdges(edges);
    }
    if (faces) {
      this.addFaces(faces);
    }
  }

  Geometry.prototype.addAttrib = function(propertyName, attributeName, data, dynamic) {
    if (data == null) {
      data = null;
    }
    if (dynamic == null) {
      dynamic = false;
    }
    this[propertyName] = data && data.length ? data : [];
    this[propertyName].name = attributeName;
    this[propertyName].dirty = true;
    this[propertyName].dynamic = dynamic;
    this.attribs[propertyName] = this[propertyName];
    return this;
  };

  Geometry.prototype.addFaces = function(data, dynamic) {
    if (data == null) {
      data = null;
    }
    if (dynamic == null) {
      dynamic = false;
    }
    this.faces = data && data.length ? data : [];
    this.faces.dirty = true;
    this.faces.dynamic = false;
    return this;
  };

  Geometry.prototype.addEdges = function(data, dynamic) {
    if (data == null) {
      data = null;
    }
    if (dynamic == null) {
      dynamic = false;
    }
    this.edges = data && data.length ? data : [];
    this.edges.dirty = true;
    this.edges.dynamic = false;
    return this;
  };

  Geometry.prototype.addIndices = function(data, dynamic) {
    if (data == null) {
      data = null;
    }
    if (dynamic == null) {
      dynamic = false;
    }
    this.indices = data && data.length ? data : [];
    this.indices.dirty = true;
    this.indices.dynamic = false;
    return this;
  };

  Geometry.prototype.isDirty = function(attibs) {
    var attrib, attribAlias, dirty, _ref;
    dirty = false;
    dirty || (dirty = this.faces && this.faces.dirty);
    dirty || (dirty = this.edges && this.edges.dirty);
    _ref = this.attribs;
    for (attribAlias in _ref) {
      attrib = _ref[attribAlias];
      dirty || (dirty = attrib.dirty);
    }
    return dirty;
  };

  Geometry.prototype.addEdge = function(a, b) {
    var ab, ba;
    if (!this.edges) {
      this.addEdges();
    }
    if (!this.edgeHash) {
      this.edgeHash = [];
    }
    ab = a + '_' + b;
    ba = b + '_' + a;
    if (!this.edgeHash[ab] && !this.edgeHash[ba]) {
      this.edges.push([a, b]);
      return this.edgeHash[ab] = this.edgeHash[ba] = true;
    }
  };

  Geometry.prototype.computeEdges = function() {
    var a, b, c, face, i, _i, _j, _len, _ref, _ref1, _results, _results1;
    if (this.edges) {
      this.edges.length = 0;
    } else {
      this.edges = [];
    }
    if (this.faces && this.faces.length) {
      _ref = this.faces;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        face = _ref[_i];
        if (face.length === 3) {
          this.addEdge(face[0], face[1]);
          this.addEdge(face[1], face[2]);
          this.addEdge(face[2], face[0]);
        }
        if (face.length === 4) {
          this.addEdge(face[0], face[1]);
          this.addEdge(face[1], face[2]);
          this.addEdge(face[2], face[3]);
          _results.push(this.addEdge(face[3], face[0]));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    } else {
      _results1 = [];
      for (i = _j = 0, _ref1 = this.vertices.length - 1; _j <= _ref1; i = _j += 3) {
        a = i;
        b = i + 1;
        c = i + 2;
        this.addEdge(a, b);
        this.addEdge(b, c);
        _results1.push(this.addEdge(c, a));
      }
      return _results1;
    }
  };

  Geometry.prototype.computeSmoothNormals = function() {
    var count;
    if (!this.faces) {
      throw 'Geometry[2]omputeSmoothNormals no faces found';
    }
    if (!this.normals) {
      this.addAttrib('normals', 'normal', null, false);
    }
    count = [];
    this.vertices.forEach((function(_this) {
      return function(v, i) {
        _this.normals.push(new Vec3(0, 0, 0));
        return count[i] = 0;
      };
    })(this));
    this.faces.forEach((function(_this) {
      return function(f) {
        var a, ab, ac, b, c, n;
        a = _this.vertices[f[0]];
        b = _this.vertices[f[1]];
        c = _this.vertices[f[2]];
        ab = Vec3.create().asSub(b, a).normalize();
        ac = Vec3.create().asSub(c, a).normalize();
        n = Vec3.create().asCross(ab, ac);
        _this.normals[f[0]].add(n);
        count[f[0]]++;
        _this.normals[f[1]].add(n);
        count[f[1]]++;
        _this.normals[f[2]].add(n);
        return count[f[2]]++;
      };
    })(this));
    return this.normals.forEach(function(n, i) {
      return n.scale(1 / count[i]);
    });
  };

  return Geometry;

})();

module.exports = Geometry;

},{"./Vec2":12,"./Vec3":13,"./Vec4":14}],9:[function(require,module,exports){
// Generated by CoffeeScript 1.7.1
var Mat4, Vec3;

Vec3 = require('./Vec3');

Mat4 = (function() {
  Mat4.count = 0;

  function Mat4() {
    Mat4.count++;
    this.reset();
  }

  Mat4.create = function() {
    return new Mat4();
  };

  Mat4.prototype.equals = function(m, tolerance) {
    if (tolerance == null) {
      tolerance = 0.0000001;
    }
    return (Math.abs(m.a11 - this.a11) <= tolerance) && (Math.abs(m.a12 - this.a12) <= tolerance) && (Math.abs(m.a13 - this.a13) <= tolerance) && (Math.abs(m.a14 - this.a14) <= tolerance) && (Math.abs(m.a21 - this.a21) <= tolerance) && (Math.abs(m.a22 - this.a22) <= tolerance) && (Math.abs(m.a23 - this.a23) <= tolerance) && (Math.abs(m.a24 - this.a24) <= tolerance) && (Math.abs(m.a31 - this.a31) <= tolerance) && (Math.abs(m.a32 - this.a32) <= tolerance) && (Math.abs(m.a33 - this.a33) <= tolerance) && (Math.abs(m.a34 - this.a34) <= tolerance) && (Math.abs(m.a41 - this.a41) <= tolerance) && (Math.abs(m.a42 - this.a42) <= tolerance) && (Math.abs(m.a43 - this.a43) <= tolerance) && (Math.abs(m.a44 - this.a44) <= tolerance);
  };

  Mat4.prototype.hash = function() {
    return this.a11 * 0.01 + this.a12 * 0.02 + this.a13 * 0.03 + this.a14 * 0.04 + this.a21 * 0.05 + this.a22 * 0.06 + this.a23 * 0.07 + this.a24 * 0.08 + this.a31 * 0.09 + this.a32 * 0.10 + this.a33 * 0.11 + this.a34 * 0.12 + this.a41 * 0.13 + this.a42 * 0.14 + this.a43 * 0.15 + this.a44 * 0.16;
  };

  Mat4.prototype.set4x4r = function(a11, a12, a13, a14, a21, a22, a23, a24, a31, a32, a33, a34, a41, a42, a43, a44) {
    this.a11 = a11;
    this.a12 = a12;
    this.a13 = a13;
    this.a14 = a14;
    this.a21 = a21;
    this.a22 = a22;
    this.a23 = a23;
    this.a24 = a24;
    this.a31 = a31;
    this.a32 = a32;
    this.a33 = a33;
    this.a34 = a34;
    this.a41 = a41;
    this.a42 = a42;
    this.a43 = a43;
    this.a44 = a44;
    return this;
  };

  Mat4.prototype.copy = function(m) {
    this.a11 = m.a11;
    this.a12 = m.a12;
    this.a13 = m.a13;
    this.a14 = m.a14;
    this.a21 = m.a21;
    this.a22 = m.a22;
    this.a23 = m.a23;
    this.a24 = m.a24;
    this.a31 = m.a31;
    this.a32 = m.a32;
    this.a33 = m.a33;
    this.a34 = m.a34;
    this.a41 = m.a41;
    this.a42 = m.a42;
    this.a43 = m.a43;
    this.a44 = m.a44;
    return this;
  };

  Mat4.prototype.dup = function() {
    return Mat4.create().copy(this);
  };

  Mat4.prototype.reset = function() {
    this.set4x4r(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
    return this;
  };

  Mat4.prototype.identity = function() {
    this.reset();
    return this;
  };

  Mat4.prototype.mul4x4r = function(b11, b12, b13, b14, b21, b22, b23, b24, b31, b32, b33, b34, b41, b42, b43, b44) {
    var a11, a12, a13, a14, a21, a22, a23, a24, a31, a32, a33, a34, a41, a42, a43, a44;
    a11 = this.a11;
    a12 = this.a12;
    a13 = this.a13;
    a14 = this.a14;
    a21 = this.a21;
    a22 = this.a22;
    a23 = this.a23;
    a24 = this.a24;
    a31 = this.a31;
    a32 = this.a32;
    a33 = this.a33;
    a34 = this.a34;
    a41 = this.a41;
    a42 = this.a42;
    a43 = this.a43;
    a44 = this.a44;
    this.a11 = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
    this.a12 = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
    this.a13 = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
    this.a14 = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;
    this.a21 = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
    this.a22 = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
    this.a23 = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
    this.a24 = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;
    this.a31 = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
    this.a32 = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
    this.a33 = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
    this.a34 = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;
    this.a41 = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
    this.a42 = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
    this.a43 = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
    this.a44 = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;
    return this;
  };

  Mat4.prototype.perspective = function(fovy, aspect, znear, zfar) {
    var f, nf;
    f = 1.0 / Math.tan(fovy / 180 * Math.PI / 2);
    nf = 1.0 / (znear - zfar);
    this.mul4x4r(f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (zfar + znear) * nf, 2 * znear * zfar * nf, 0, 0, -1, 0);
    return this;
  };

  Mat4.prototype.ortho = function(l, r, b, t, n, f) {
    this.mul4x4r(2 / (r - l), 0, 0, (r + l) / (l - r), 0, 2 / (t - b), 0, (t + b) / (b - t), 0, 0, 2 / (n - f), (f + n) / (n - f), 0, 0, 0, 1);
    return this;
  };

  Mat4.prototype.lookAt = function(eye, target, up) {
    var x, y, z;
    z = (Vec3.create(eye.x - target.x, eye.y - target.y, eye.z - target.z)).normalize();
    x = (Vec3.create(up.x, up.y, up.z)).cross(z).normalize();
    y = Vec3.create().copy(z).cross(x).normalize();
    this.mul4x4r(x.x, x.y, x.z, 0, y.x, y.y, y.z, 0, z.x, z.y, z.z, 0, 0, 0, 0, 1);
    this.translate(-eye.x, -eye.y, -eye.z);
    return this;
  };

  Mat4.prototype.translate = function(dx, dy, dz) {
    this.mul4x4r(1, 0, 0, dx, 0, 1, 0, dy, 0, 0, 1, dz, 0, 0, 0, 1);
    return this;
  };

  Mat4.prototype.rotate = function(theta, x, y, z) {
    var c, s;
    s = Math.sin(theta);
    c = Math.cos(theta);
    this.mul4x4r(x * x * (1 - c) + c, x * y * (1 - c) - z * s, x * z * (1 - c) + y * s, 0, y * x * (1 - c) + z * s, y * y * (1 - c) + c, y * z * (1 - c) - x * s, 0, x * z * (1 - c) - y * s, y * z * (1 - c) + x * s, z * z * (1 - c) + c, 0, 0, 0, 0, 1);
    return this;
  };

  Mat4.prototype.asMul = function(a, b) {
    var a11, a12, a13, a14, a21, a22, a23, a24, a31, a32, a33, a34, a41, a42, a43, a44, b11, b12, b13, b14, b21, b22, b23, b24, b31, b32, b33, b34, b41, b42, b43, b44;
    a11 = a.a11;
    a12 = a.a12;
    a13 = a.a13;
    a14 = a.a14;
    a21 = a.a21;
    a22 = a.a22;
    a23 = a.a23;
    a24 = a.a24;
    a31 = a.a31;
    a32 = a.a32;
    a33 = a.a33;
    a34 = a.a34;
    a41 = a.a41;
    a42 = a.a42;
    a43 = a.a43;
    a44 = a.a44;
    b11 = b.a11;
    b12 = b.a12;
    b13 = b.a13;
    b14 = b.a14;
    b21 = b.a21;
    b22 = b.a22;
    b23 = b.a23;
    b24 = b.a24;
    b31 = b.a31;
    b32 = b.a32;
    b33 = b.a33;
    b34 = b.a34;
    b41 = b.a41;
    b42 = b.a42;
    b43 = b.a43;
    b44 = b.a44;
    this.a11 = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
    this.a12 = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
    this.a13 = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
    this.a14 = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;
    this.a21 = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
    this.a22 = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
    this.a23 = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
    this.a24 = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;
    this.a31 = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
    this.a32 = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
    this.a33 = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
    this.a34 = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;
    this.a41 = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
    this.a42 = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
    this.a43 = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
    this.a44 = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;
    return this;
  };

  Mat4.prototype.mul = function(b) {
    return this.asMul(this, b);
  };

  Mat4.prototype.scale = function(sx, sy, sz) {
    this.mul4x4r(sx, 0, 0, 0, 0, sy, 0, 0, 0, 0, sz, 0, 0, 0, 0, 1);
    return this;
  };

  Mat4.prototype.invert = function() {
    var a0, a1, a2, a3, a4, a5, b0, b1, b2, b3, b4, b5, invdet, x0, x1, x10, x11, x12, x13, x14, x15, x2, x3, x4, x5, x6, x7, x8, x9;
    x0 = this.a11;
    x1 = this.a12;
    x2 = this.a13;
    x3 = this.a14;
    x4 = this.a21;
    x5 = this.a22;
    x6 = this.a23;
    x7 = this.a24;
    x8 = this.a31;
    x9 = this.a32;
    x10 = this.a33;
    x11 = this.a34;
    x12 = this.a41;
    x13 = this.a42;
    x14 = this.a43;
    x15 = this.a44;
    a0 = x0 * x5 - x1 * x4;
    a1 = x0 * x6 - x2 * x4;
    a2 = x0 * x7 - x3 * x4;
    a3 = x1 * x6 - x2 * x5;
    a4 = x1 * x7 - x3 * x5;
    a5 = x2 * x7 - x3 * x6;
    b0 = x8 * x13 - x9 * x12;
    b1 = x8 * x14 - x10 * x12;
    b2 = x8 * x15 - x11 * x12;
    b3 = x9 * x14 - x10 * x13;
    b4 = x9 * x15 - x11 * x13;
    b5 = x10 * x15 - x11 * x14;
    invdet = 1 / (a0 * b5 - a1 * b4 + a2 * b3 + a3 * b2 - a4 * b1 + a5 * b0);
    this.a11 = (+x5 * b5 - x6 * b4 + x7 * b3) * invdet;
    this.a12 = (-x1 * b5 + x2 * b4 - x3 * b3) * invdet;
    this.a13 = (+x13 * a5 - x14 * a4 + x15 * a3) * invdet;
    this.a14 = (-x9 * a5 + x10 * a4 - x11 * a3) * invdet;
    this.a21 = (-x4 * b5 + x6 * b2 - x7 * b1) * invdet;
    this.a22 = (+x0 * b5 - x2 * b2 + x3 * b1) * invdet;
    this.a23 = (-x12 * a5 + x14 * a2 - x15 * a1) * invdet;
    this.a24 = (+x8 * a5 - x10 * a2 + x11 * a1) * invdet;
    this.a31 = (+x4 * b4 - x5 * b2 + x7 * b0) * invdet;
    this.a32 = (-x0 * b4 + x1 * b2 - x3 * b0) * invdet;
    this.a33 = (+x12 * a4 - x13 * a2 + x15 * a0) * invdet;
    this.a34 = (-x8 * a4 + x9 * a2 - x11 * a0) * invdet;
    this.a41 = (-x4 * b3 + x5 * b1 - x6 * b0) * invdet;
    this.a42 = (+x0 * b3 - x1 * b1 + x2 * b0) * invdet;
    this.a43 = (-x12 * a3 + x13 * a1 - x14 * a0) * invdet;
    this.a44 = (+x8 * a3 - x9 * a1 + x10 * a0) * invdet;
    return this;
  };

  Mat4.prototype.transpose = function() {
    var a11, a12, a13, a14, a21, a22, a23, a24, a31, a32, a33, a34, a41, a42, a43, a44;
    a11 = this.a11;
    a12 = this.a12;
    a13 = this.a13;
    a14 = this.a14;
    a21 = this.a21;
    a22 = this.a22;
    a23 = this.a23;
    a24 = this.a24;
    a31 = this.a31;
    a32 = this.a32;
    a33 = this.a33;
    a34 = this.a34;
    a41 = this.a41;
    a42 = this.a42;
    a43 = this.a43;
    a44 = this.a44;
    this.a11 = a11;
    this.a12 = a21;
    this.a13 = a31;
    this.a14 = a41;
    this.a21 = a12;
    this.a22 = a22;
    this.a23 = a32;
    this.a24 = a42;
    this.a31 = a13;
    this.a32 = a23;
    this.a33 = a33;
    this.a34 = a43;
    this.a41 = a14;
    this.a42 = a24;
    this.a43 = a34;
    this.a44 = a44;
    return this;
  };

  Mat4.prototype.toArray = function() {
    return [this.a11, this.a21, this.a31, this.a41, this.a12, this.a22, this.a32, this.a42, this.a13, this.a23, this.a33, this.a43, this.a14, this.a24, this.a34, this.a44];
  };

  Mat4.prototype.fromArray = function(a) {
    this.a11 = a[0](this.a21 = a[1](this.a31 = a[2](this.a41 = a[3])));
    this.a12 = a[4](this.a22 = a[5](this.a32 = a[6](this.a42 = a[7])));
    this.a13 = a[8](this.a23 = a[9](this.a33 = a[10](this.a43 = a[11])));
    this.a14 = a[12](this.a24 = a[13](this.a34 = a[14](this.a44 = a[15])));
    return this;
  };

  return Mat4;

})();

Mat4.count = 0;

module.exports = Mat4;

},{"./Vec3":13}],10:[function(require,module,exports){
// Generated by CoffeeScript 1.7.1
var Mat4, Quat, kEpsilon;

kEpsilon = Math.pow(2, -24);

Mat4 = require('./Mat4');

Quat = (function() {
  Quat.count = 0;

  function Quat(x, y, z, w) {
    this.x = x != null ? x : 0;
    this.y = y != null ? y : 0;
    this.z = z != null ? z : 0;
    this.w = w != null ? w : 1;
    Quat.count++;
  }

  Quat.create = function(x, y, z, w) {
    return new Quat(x, y, z, w);
  };

  Quat.prototype.identity = function() {
    this.set(0, 0, 0, 1);
    return this;
  };

  Quat.prototype.equals = function(q, tolerance) {
    if (tolerance == null) {
      tolerance = 0.0000001;
    }
    return (Math.abs(q.x - this.x) <= tolerance) && (Math.abs(q.y - this.y) <= tolerance) && (Math.abs(q.z - this.z) <= tolerance) && (Math.abs(q.w - this.w) <= tolerance);
  };

  Quat.prototype.hash = function() {
    return 1 * this.x + 12 * this.y + 123 * this.z + 1234 * this.w;
  };

  Quat.prototype.copy = function(q) {
    this.x = q.x;
    this.y = q.y;
    this.z = q.z;
    this.w = q.w;
    return this;
  };

  Quat.prototype.clone = function() {
    return new Quat(this.x, this.y, this.z, this.w);
  };

  Quat.prototype.dup = function() {
    return this.clone();
  };

  Quat.prototype.setAxisAngle = function(v, a) {
    var s;
    a = a * 0.5;
    s = Math.sin(a / 180 * Math.PI);
    this.x = s * v.x;
    this.y = s * v.y;
    this.z = s * v.z;
    this.w = Math.cos(a / 180 * Math.PI);
    return this;
  };

  Quat.prototype.setQuat = function(q) {
    this.x = q.x;
    this.y = q.y;
    this.z = q.z;
    this.w = q.w;
    return this;
  };

  Quat.prototype.set = function(x, y, z, w) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
    return this;
  };

  Quat.prototype.asMul = function(p, q) {
    var pw, px, py, pz, qw, qx, qy, qz;
    px = p.x;
    py = p.y;
    pz = p.z;
    pw = p.w;
    qx = q.x;
    qy = q.y;
    qz = q.z;
    qw = q.w;
    this.x = px * qw + pw * qx + py * qz - pz * qy;
    this.y = py * qw + pw * qy + pz * qx - px * qz;
    this.z = pz * qw + pw * qz + px * qy - py * qx;
    this.w = pw * qw - px * qx - py * qy - pz * qz;
    return this;
  };

  Quat.prototype.mul = function(q) {
    this.asMul(this, q);
    return this;
  };

  Quat.prototype.mul4 = function(x, y, z, w) {
    var aw, ax, ay, az;
    ax = this.x;
    ay = this.y;
    az = this.z;
    aw = this.w;
    this.x = w * ax + x * aw + y * az - z * ay;
    this.y = w * ay + y * aw + z * ax - x * az;
    this.z = w * az + z * aw + x * ay - y * ax;
    this.w = w * aw - x * ax - y * ay - z * az;
    return this;
  };

  Quat.prototype.length = function() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
  };

  Quat.prototype.normalize = function() {
    var len;
    len = this.length();
    if (len > kEpsilon) {
      this.x /= len;
      this.y /= len;
      this.z /= len;
      this.w /= len;
    }
    return this;
  };

  Quat.prototype.toMat4 = function(out) {
    var m, wx, wy, wz, xs, xx, xy, xz, ys, yy, yz, zs, zz;
    xs = this.x + this.x;
    ys = this.y + this.y;
    zs = this.z + this.z;
    wx = this.w * xs;
    wy = this.w * ys;
    wz = this.w * zs;
    xx = this.x * xs;
    xy = this.x * ys;
    xz = this.x * zs;
    yy = this.y * ys;
    yz = this.y * zs;
    zz = this.z * zs;
    m = out || new Mat4();
    return m.set4x4r(1 - (yy + zz), xy - wz, xz + wy, 0, xy + wz, 1 - (xx + zz), yz - wx, 0, xz - wy, yz + wx, 1 - (xx + yy), 0, 0, 0, 0, 1);
  };

  return Quat;

})();

module.exports = Quat;

},{"./Mat4":9}],11:[function(require,module,exports){
var Vec3 = require('./Vec3');

//A ray.  
//
//Consists of the starting point *origin* and the *direction* vector.  
//Used for collision detection.
//### Ray ( )
function Ray(origin, direction) {
  this.origin = origin || new Vec3(0, 0, 0);
  this.direction = direction || new Vec3(0, 0, 1);
}

//http://wiki.cgsociety.org/index.php/Ray_Sphere_Intersection
Ray.prototype.hitTestSphere = function (pos, r) {
  var hits = [];
  var d = this.direction;
  var o = this.origin;
  var osp = o.dup().sub(pos);
  var A = d.dot(d);
  if (A == 0) {
    return hits;
  }
  var B = 2 * osp.dot(d);
  var C = osp.dot(osp) - r * r;
  var sq = Math.sqrt(B * B - 4 * A * C);
  if (isNaN(sq)) {
    return hits;
  }
  var t0 = (-B - sq) / (2 * A);
  var t1 = (-B + sq) / (2 * A);
  hits.push(o.dup().add(d.dup().scale(t0)));
  if (t0 != t1) {
    hits.push(o.dup().add(d.dup().scale(t1)));
  }
  return hits;
};

//http://www.cs.princeton.edu/courses/archive/fall00/cs426/lectures/raycast/sld017.htm
//http://cgafaq.info/wiki/Ray_Plane_Intersection
Ray.prototype.hitTestPlane = function (pos, normal) {
  if (this.direction.dot(normal) == 0) {
    return [];
  }
  var t = normal.dup().scale(-1).dot(this.origin.dup().sub(pos)) / this.direction.dot(normal);
  return [this.origin.dup().add(this.direction.dup().scale(t))];
};

Ray.prototype.hitTestBoundingBox = function (bbox) {
  var hits = [];
  var self = this;
  function testFace(pos, size, normal, u, v) {
    var faceHits = self.hitTestPlane(pos, normal);
    if (faceHits.length > 0) {
      var hit = faceHits[0];
      if (hit[u] > pos[u] - size[u] / 2 && hit[u] < pos[u] + size[u] / 2 && hit[v] > pos[v] - size[v] / 2 && hit[v] < pos[v] + size[v] / 2) {
        hits.push(hit);
      }
    }
  }
  var bboxCenter = bbox.getCenter();
  var bboxSize = bbox.getSize();
  testFace(bboxCenter.dup().add(new Vec3(0, 0, bboxSize.z / 2)), bboxSize, new Vec3(0, 0, 1), 'x', 'y');
  testFace(bboxCenter.dup().add(new Vec3(0, 0, -bboxSize.z / 2)), bboxSize, new Vec3(0, 0, -1), 'x', 'y');
  testFace(bboxCenter.dup().add(new Vec3(bboxSize.x / 2, 0, 0)), bboxSize, new Vec3(1, 0, 0), 'y', 'z');
  testFace(bboxCenter.dup().add(new Vec3(-bboxSize.x / 2, 0, 0)), bboxSize, new Vec3(-1, 0, 0), 'y', 'z');
  testFace(bboxCenter.dup().add(new Vec3(0, bboxSize.y / 2, 0)), bboxSize, new Vec3(0, 1, 0), 'x', 'z');
  testFace(bboxCenter.dup().add(new Vec3(0, -bboxSize.y / 2, 0)), bboxSize, new Vec3(0, -1, 0), 'x', 'z');

  hits.forEach(function (hit) {
    hit._distance = hit.distance(self.origin);
  });

  hits.sort(function (a, b) {
    return a._distance - b._distance;
  });

  hits.forEach(function (hit) {
    delete hit._distance;
  });

  if (hits.length > 0) {
    hits = [hits[0]];
  }

  return hits;
};

module.exports = Ray;
},{"./Vec3":13}],12:[function(require,module,exports){
// Generated by CoffeeScript 1.7.1
var Vec2;

Vec2 = (function() {
  Vec2.prototype.x = 0;

  Vec2.prototype.y = 0;

  Vec2.count = 0;

  function Vec2(x, y) {
    this.x = x != null ? x : 0;
    this.y = y != null ? y : 0;
    Vec2.count++;
  }

  Vec2.create = function(x, y) {
    return new Vec2(x, y);
  };

  Vec2.prototype.set = function(x, y) {
    this.x = x;
    this.y = y;
    return this;
  };

  Vec2.prototype.equals = function(v, tolerance) {
    if (tolerance == null) {
      tolerance = 0.0000001;
    }
    return (Math.abs(v.x - this.x) <= tolerance) && (Math.abs(v.y - this.y) <= tolerance);
  };

  Vec2.prototype.hash = function() {
    return 1 * this.x + 12 * this.y;
  };

  Vec2.prototype.setVec2 = function(v) {
    this.x = v.x;
    this.y = v.y;
    return this;
  };

  Vec2.prototype.add = function(v) {
    this.x += v.x;
    this.y += v.y;
    return this;
  };

  Vec2.prototype.sub = function(v) {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  };

  Vec2.prototype.scale = function(f) {
    this.x *= f;
    this.y *= f;
    return this;
  };

  Vec2.prototype.distance = function(v) {
    var dx, dy;
    dx = v.x - this.x;
    dy = v.y - this.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  Vec2.prototype.dot = function(b) {
    return this.x * b.x + this.y * b.y;
  };

  Vec2.prototype.copy = function(v) {
    this.x = v.x;
    this.y = v.y;
    return this;
  };

  Vec2.prototype.clone = function() {
    return new Vec2(this.x, this.y);
  };

  Vec2.prototype.dup = function() {
    return this.clone();
  };

  Vec2.prototype.asAdd = function(a, b) {
    this.x = a.x + b.x;
    this.y = a.y + b.y;
    return this;
  };

  Vec2.prototype.asSub = function(a, b) {
    this.x = a.x - b.x;
    this.y = a.y - b.y;
    return this;
  };

  Vec2.prototype.length = function() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  };

  Vec2.prototype.normalize = function() {
    var len;
    len = this.length();
    if (len > 0) {
      this.scale(1 / len);
    }
    return this;
  };

  Vec2.prototype.toString = function() {
    return "{" + this.x + "," + this.y + "}";
  };

  return Vec2;

})();

module.exports = Vec2;

},{}],13:[function(require,module,exports){
// Generated by CoffeeScript 1.7.1
var Vec3;

Vec3 = (function() {
  Vec3.prototype.x = 0;

  Vec3.prototype.y = 0;

  Vec3.prototype.z = 0;

  Vec3.count = 0;

  function Vec3(x, y, z) {
    this.x = x != null ? x : 0;
    this.y = y != null ? y : 0;
    this.z = z != null ? z : 0;
    Vec3.count++;
  }

  Vec3.create = function(x, y, z) {
    return new Vec3(x, y, z);
  };

  Vec3.prototype.hash = function() {
    return 1 * this.x + 12 * this.y + 123 * this.z;
  };

  Vec3.prototype.set = function(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  };

  Vec3.prototype.add = function(v) {
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
    return this;
  };

  Vec3.prototype.sub = function(v) {
    this.x -= v.x;
    this.y -= v.y;
    this.z -= v.z;
    return this;
  };

  Vec3.prototype.scale = function(f) {
    this.x *= f;
    this.y *= f;
    this.z *= f;
    return this;
  };

  Vec3.prototype.distance = function(v) {
    var dx, dy, dz;
    dx = v.x - this.x;
    dy = v.y - this.y;
    dz = v.z - this.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  };

  Vec3.prototype.squareDistance = function(v) {
    var dx, dy, dz;
    dx = v.x - this.x;
    dy = v.y - this.y;
    dz = v.z - this.z;
    return dx * dx + dy * dy + dz * dz;
  };

  Vec3.prototype.copy = function(v) {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
    return this;
  };

  Vec3.prototype.setVec3 = function(v) {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
    return this;
  };

  Vec3.prototype.clone = function() {
    return new Vec3(this.x, this.y, this.z);
  };

  Vec3.prototype.dup = function() {
    return this.clone();
  };

  Vec3.prototype.cross = function(v) {
    var vx, vy, vz, x, y, z;
    x = this.x;
    y = this.y;
    z = this.z;
    vx = v.x;
    vy = v.y;
    vz = v.z;
    this.x = y * vz - z * vy;
    this.y = z * vx - x * vz;
    this.z = x * vy - y * vx;
    return this;
  };

  Vec3.prototype.dot = function(b) {
    return this.x * b.x + this.y * b.y + this.z * b.z;
  };

  Vec3.prototype.asAdd = function(a, b) {
    this.x = a.x + b.x;
    this.y = a.y + b.y;
    this.z = a.z + b.z;
    return this;
  };

  Vec3.prototype.asSub = function(a, b) {
    this.x = a.x - b.x;
    this.y = a.y - b.y;
    this.z = a.z - b.z;
    return this;
  };

  Vec3.prototype.asCross = function(a, b) {
    return this.copy(a).cross(b);
  };

  Vec3.prototype.addScaled = function(a, f) {
    this.x += a.x * f;
    this.y += a.y * f;
    this.z += a.z * f;
    return this;
  };

  Vec3.prototype.length = function() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  };

  Vec3.prototype.lengthSquared = function() {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  };

  Vec3.prototype.normalize = function() {
    var len;
    len = this.length();
    if (len > 0) {
      this.scale(1 / len);
    }
    return this;
  };

  Vec3.prototype.transformQuat = function(q) {
    var iw, ix, iy, iz, qw, qx, qy, qz, x, y, z;
    x = this.x;
    y = this.y;
    z = this.z;
    qx = q.x;
    qy = q.y;
    qz = q.z;
    qw = q.w;
    ix = qw * x + qy * z - qz * y;
    iy = qw * y + qz * x - qx * z;
    iz = qw * z + qx * y - qy * x;
    iw = -qx * x - qy * y - qz * z;
    this.x = ix * qw + iw * -qx + iy * -qz - iz * -qy;
    this.y = iy * qw + iw * -qy + iz * -qx - ix * -qz;
    this.z = iz * qw + iw * -qz + ix * -qy - iy * -qx;
    return this;
  };

  Vec3.prototype.transformMat4 = function(m) {
    var x, y, z;
    x = m.a14 + m.a11 * this.x + m.a12 * this.y + m.a13 * this.z;
    y = m.a24 + m.a21 * this.x + m.a22 * this.y + m.a23 * this.z;
    z = m.a34 + m.a31 * this.x + m.a32 * this.y + m.a33 * this.z;
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  };

  Vec3.prototype.equals = function(v, tolerance) {
    tolerance = tolerance != null ? tolerance : 0.0000001;
    return (Math.abs(v.x - this.x) <= tolerance) && (Math.abs(v.y - this.y) <= tolerance) && (Math.abs(v.z - this.z) <= tolerance);
  };

  Vec3.prototype.toString = function() {
    return "{" + this.x + "," + this.y + "," + this.z + "}";
  };

  Vec3.Zero = new Vec3(0, 0, 0);

  Vec3;

  return Vec3;

})();

module.exports = Vec3;

},{}],14:[function(require,module,exports){
// Generated by CoffeeScript 1.7.1
var Vec4;

Vec4 = (function() {
  Vec4.prototype.x = 0;

  Vec4.prototype.y = 0;

  Vec4.prototype.z = 0;

  Vec4.prototype.w = 0;

  Vec4.count = 0;

  function Vec4(x, y, z, w) {
    this.x = x != null ? x : 0;
    this.y = y != null ? y : 0;
    this.z = z != null ? z : 0;
    this.w = w != null ? w : 0;
    Vec4.count++;
  }

  Vec4.prototype.equals = function(v, tolerance) {
    if (tolerance == null) {
      tolerance = 0.0000001;
    }
    return (Math.abs(v.x - this.x) <= tolerance) && (Math.abs(v.y - this.y) <= tolerance) && (Math.abs(v.z - this.z) <= tolerance) && (Math.abs(v.w - this.w) <= tolerance);
  };

  Vec4.prototype.hash = function() {
    return 1 * this.x + 12 * this.y + 123 * this.z + 1234 * this.w;
  };

  Vec4.create = function(x, y, z, w) {
    return new Vec4(x, y, z, w);
  };

  Vec4.prototype.set = function(x, y, z, w) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
    return this;
  };

  Vec4.prototype.setVec4 = function(v) {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
    this.w = v.w;
    return this;
  };

  Vec4.prototype.transformMat4 = function(m) {
    var w, x, y, z;
    x = m.a14 * this.w + m.a11 * this.x + m.a12 * this.y + m.a13 * this.z;
    y = m.a24 * this.w + m.a21 * this.x + m.a22 * this.y + m.a23 * this.z;
    z = m.a34 * this.w + m.a31 * this.x + m.a32 * this.y + m.a33 * this.z;
    w = m.a44 * this.w + m.a41 * this.x + m.a42 * this.y + m.a43 * this.z;
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
    return this;
  };

  return Vec4;

})();

module.exports = Vec4;

},{}],15:[function(require,module,exports){
// Generated by CoffeeScript 1.7.1
var Cube, Geometry, Vec2, Vec3,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Vec2 = require('../Vec2');

Vec3 = require('../Vec3');

Geometry = require('../Geometry');

Cube = (function(_super) {
  __extends(Cube, _super);

  function Cube(sx, sy, sz, nx, ny, nz) {
    var makePlane, numVertices, vertexIndex;
    sx = sx != null ? sx : 1;
    sy = sy != null ? sy : sx != null ? sx : 1;
    sz = sz != null ? sz : sx != null ? sx : 1;
    nx = nx || 1;
    ny = ny || 1;
    nz = nz || 1;
    numVertices = (nx + 1) * (ny + 1) * 2 + (nx + 1) * (nz + 1) * 2 + (nz + 1) * (ny + 1) * 2;
    Cube.__super__.constructor.call(this, {
      vertices: true,
      normals: true,
      texCoords: true,
      faces: true
    });
    vertexIndex = 0;
    makePlane = (function(_this) {
      return function(u, v, w, su, sv, nu, nv, pw, flipu, flipv) {
        var face, i, j, n, normal, texCoord, vert, vertShift, _i, _j, _k, _ref, _results;
        vertShift = vertexIndex;
        for (j = _i = 0; 0 <= nv ? _i <= nv : _i >= nv; j = 0 <= nv ? ++_i : --_i) {
          for (i = _j = 0; 0 <= nu ? _j <= nu : _j >= nu; i = 0 <= nu ? ++_j : --_j) {
            vert = _this.vertices[vertexIndex] = Vec3.create();
            vert[u] = (-su / 2 + i * su / nu) * flipu;
            vert[v] = (-sv / 2 + j * sv / nv) * flipv;
            vert[w] = pw;
            normal = _this.normals[vertexIndex] = Vec3.create();
            normal[u] = 0;
            normal[v] = 0;
            normal[w] = pw / Math.abs(pw);
            texCoord = _this.texCoords[vertexIndex] = Vec2.create();
            texCoord.x = i / nu;
            texCoord.y = 1.0 - j / nv;
            ++vertexIndex;
          }
        }
        _results = [];
        for (j = _k = 0, _ref = nv - 1; 0 <= _ref ? _k <= _ref : _k >= _ref; j = 0 <= _ref ? ++_k : --_k) {
          _results.push((function() {
            var _l, _ref1, _results1;
            _results1 = [];
            for (i = _l = 0, _ref1 = nu - 1; 0 <= _ref1 ? _l <= _ref1 : _l >= _ref1; i = 0 <= _ref1 ? ++_l : --_l) {
              n = vertShift + j * (nu + 1) + i;
              face = [n, n + nu + 1, n + nu + 2, n + 1];
              _results1.push(this.faces.push(face));
            }
            return _results1;
          }).call(_this));
        }
        return _results;
      };
    })(this);
    makePlane('x', 'y', 'z', sx, sy, nx, ny, sz / 2, 1, -1);
    makePlane('x', 'y', 'z', sx, sy, nx, ny, -sz / 2, -1, -1);
    makePlane('z', 'y', 'x', sz, sy, nz, ny, -sx / 2, 1, -1);
    makePlane('z', 'y', 'x', sz, sy, nz, ny, sx / 2, -1, -1);
    makePlane('x', 'z', 'y', sx, sz, nx, nz, sy / 2, 1, 1);
    makePlane('x', 'z', 'y', sx, sz, nx, nz, -sy / 2, 1, -1);
  }

  return Cube;

})(Geometry);

module.exports = Cube;

},{"../Geometry":8,"../Vec2":12,"../Vec3":13}],16:[function(require,module,exports){
// Generated by CoffeeScript 1.7.1
var Geometry, Sphere, Vec2, Vec3,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Vec2 = require('../Vec2');

Vec3 = require('../Vec3');

Geometry = require('../Geometry');

Sphere = (function(_super) {
  __extends(Sphere, _super);

  function Sphere(r, nsides, nsegments) {
    var degToRad, dphi, dtheta, evalPos, normal, numVertices, phi, segment, side, texCoord, theta, vert, vertexIndex, _i, _j;
    if (r == null) {
      r = 0.5;
    }
    if (nsides == null) {
      nsides = 36;
    }
    if (nsegments == null) {
      nsegments = 18;
    }
    numVertices = (nsides + 1) * (nsegments + 1);
    vertexIndex = 0;
    Sphere.__super__.constructor.call(this, {
      vertices: true,
      normals: true,
      texCoords: true,
      faces: true
    });
    degToRad = 1 / 180.0 * Math.PI;
    dtheta = 180.0 / nsegments;
    dphi = 360.0 / nsides;
    evalPos = function(pos, theta, phi) {
      pos.x = r * Math.sin(theta * degToRad) * Math.sin(phi * degToRad);
      pos.y = r * Math.cos(theta * degToRad);
      return pos.z = r * Math.sin(theta * degToRad) * Math.cos(phi * degToRad);
    };
    theta = 0;
    segment = 0;
    for (segment = _i = 0; 0 <= nsegments ? _i <= nsegments : _i >= nsegments; segment = 0 <= nsegments ? ++_i : --_i) {
      theta = segment * dtheta;
      for (side = _j = 0; 0 <= nsides ? _j <= nsides : _j >= nsides; side = 0 <= nsides ? ++_j : --_j) {
        phi = side * dphi;
        vert = this.vertices[vertexIndex] = Vec3.create();
        normal = this.normals[vertexIndex] = Vec3.create();
        texCoord = this.texCoords[vertexIndex] = Vec2.create();
        evalPos(vert, theta, phi);
        normal.copy(vert).normalize();
        texCoord.set(phi / 360.0, theta / 180.0);
        ++vertexIndex;
        if (segment === nsegments) {
          continue;
        }
        if (side === nsides) {
          continue;
        }
        if (segment < nsegments - 1) {
          this.faces.push([segment * (nsides + 1) + side, (segment + 1) * (nsides + 1) + side, (segment + 1) * (nsides + 1) + side + 1]);
        }
        if (segment > 0) {
          this.faces.push([segment * (nsides + 1) + side, (segment + 1) * (nsides + 1) + side + 1, segment * (nsides + 1) + side + 1]);
        }
      }
    }
  }

  return Sphere;

})(Geometry);

module.exports = Sphere;

},{"../Geometry":8,"../Vec2":12,"../Vec3":13}],17:[function(require,module,exports){
module.exports.Context = require('./lib/Context');
module.exports.Texture2D = require('./lib/Texture2D');
module.exports.TextureCube = require('./lib/TextureCube');
module.exports.Program = require('./lib/Program');
module.exports.Material = require('./lib/Material');
module.exports.Mesh = require('./lib/Mesh');
module.exports.OrthographicCamera = require('./lib/OrthographicCamera');
module.exports.PerspectiveCamera = require('./lib/PerspectiveCamera');
module.exports.Arcball = require('./lib/Arcball');
module.exports.ScreenImage = require('./lib/ScreenImage');
module.exports.RenderTarget = require('./lib/RenderTarget');

//export all functions from Utils to module exports
var Utils = require('./lib/Utils');
for(var funcName in Utils) {
  module.exports[funcName] = Utils[funcName];
}


},{"./lib/Arcball":18,"./lib/Context":20,"./lib/Material":21,"./lib/Mesh":22,"./lib/OrthographicCamera":23,"./lib/PerspectiveCamera":24,"./lib/Program":25,"./lib/RenderTarget":26,"./lib/ScreenImage":28,"./lib/Texture2D":30,"./lib/TextureCube":31,"./lib/Utils":32}],18:[function(require,module,exports){
// Generated by CoffeeScript 1.7.1
var Arcball, Mat4, Quat, Vec2, Vec3, Vec4, _ref;

_ref = require('pex-geom'), Vec2 = _ref.Vec2, Vec3 = _ref.Vec3, Vec4 = _ref.Vec4, Quat = _ref.Quat, Mat4 = _ref.Mat4;

Arcball = (function() {
  function Arcball(window, camera, distance) {
    this.distance = distance || 2;
    this.minDistance = distance / 2 || 0.3;
    this.maxDistance = distance * 2 || 5;
    this.camera = camera;
    this.window = window;
    this.radius = Math.min(window.width / 2, window.height / 2) * 2;
    this.center = Vec2.create(window.width / 2, window.height / 2);
    this.currRot = Quat.create();
    this.currRot.setAxisAngle(Vec3.create(0, 1, 0), 180);
    this.clickRot = Quat.create();
    this.dragRot = Quat.create();
    this.clickPos = Vec3.create();
    this.dragPos = Vec3.create();
    this.rotAxis = Vec3.create();
    this.allowZooming = true;
    this.enabled = true;
    this.updateCamera();
    this.addEventHanlders();
  }

  Arcball.prototype.addEventHanlders = function() {
    this.window.on('leftMouseDown', (function(_this) {
      return function(e) {
        if (e.handled || !_this.enabled) {
          return;
        }
        return _this.down(e.x, _this.window.height - e.y);
      };
    })(this));
    this.window.on('mouseDragged', (function(_this) {
      return function(e) {
        if (e.handled || !_this.enabled) {
          return;
        }
        return _this.drag(e.x, _this.window.height - e.y);
      };
    })(this));
    return this.window.on('scrollWheel', (function(_this) {
      return function(e) {
        if (e.handled || !_this.enabled) {
          return;
        }
        if (!_this.allowZooming) {
          return;
        }
        _this.distance = Math.min(_this.maxDistance, Math.max(_this.distance + e.dy / 100 * (_this.maxDistance - _this.minDistance), _this.minDistance));
        return _this.updateCamera();
      };
    })(this));
  };

  Arcball.prototype.mouseToSphere = function(x, y) {
    var dist, v;
    v = Vec3.create((x - this.center.x) / this.radius, -(y - this.center.y) / this.radius, 0);
    dist = v.x * v.x + v.y * v.y;
    if (dist > 1) {
      v.normalize();
    } else {
      v.z = Math.sqrt(1.0 - dist);
    }
    return v;
  };

  Arcball.prototype.down = function(x, y) {
    this.clickPos = this.mouseToSphere(x, y);
    this.clickRot.copy(this.currRot);
    return this.updateCamera();
  };

  Arcball.prototype.drag = function(x, y) {
    var theta;
    this.dragPos = this.mouseToSphere(x, y);
    this.rotAxis.asCross(this.clickPos, this.dragPos);
    theta = this.clickPos.dot(this.dragPos);
    this.dragRot.set(this.rotAxis.x, this.rotAxis.y, this.rotAxis.z, theta);
    this.currRot.asMul(this.dragRot, this.clickRot);
    return this.updateCamera();
  };

  Arcball.prototype.updateCamera = function() {
    var eye, offset, q, target, up;
    q = this.currRot.clone();
    q.w *= -1;
    target = this.target || Vec3.create(0, 0, 0);
    offset = Vec3.create(0, 0, this.distance).transformQuat(q);
    eye = Vec3.create().asSub(target, offset);
    up = Vec3.create(0, 1, 0).transformQuat(q);
    return this.camera.lookAt(target, eye, up);
  };

  Arcball.prototype.disableZoom = function() {
    return this.allowZooming = false;
  };

  Arcball.prototype.setDistance = function(distance) {
    this.distance = distance || 2;
    this.minDistance = distance / 2 || 0.3;
    this.maxDistance = distance * 2 || 5;
    return this.updateCamera();
  };

  return Arcball;

})();

module.exports = Arcball;

},{"pex-geom":7}],19:[function(require,module,exports){
// Generated by CoffeeScript 1.7.1
var Buffer, Color, Context, Edge, Face3, Face4, FacePolygon, Vec2, Vec3, Vec4, _ref;

Context = require('pex-glu').Context;

_ref = require('pex-geom'), Vec2 = _ref.Vec2, Vec3 = _ref.Vec3, Vec4 = _ref.Vec4, Edge = _ref.Edge, Face3 = _ref.Face3, Face4 = _ref.Face4, FacePolygon = _ref.FacePolygon;

Color = require('pex-color').Color;

Buffer = (function() {
  function Buffer(target, type, data, usage) {
    this.gl = Context.currentContext;
    this.target = target;
    this.type = type;
    this.usage = usage || gl.STATIC_DRAW;
    this.dataBuf = null;
    if (data) {
      this.update(data, this.usage);
    }
  }

  Buffer.prototype.dispose = function() {
    this.gl.deleteBuffer(this.handle);
    return this.handle = null;
  };

  Buffer.prototype.update = function(data, usage) {
    var e, face, i, index, numIndices, v, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _len5, _len6, _len7, _m, _n, _o, _p;
    if (!this.handle) {
      this.handle = this.gl.createBuffer();
    }
    this.usage = usage || this.usage;
    if (!data || data.length === 0) {
      return;
    }
    if (!isNaN(data[0])) {
      if (!this.dataBuf || this.dataBuf.length !== data.length) {
        this.dataBuf = new this.type(data.length);
      }
      for (i = _i = 0, _len = data.length; _i < _len; i = ++_i) {
        v = data[i];
        this.dataBuf[i] = v;
        this.elementSize = 1;
      }
    } else if (data[0] instanceof Vec2) {
      if (!this.dataBuf || this.dataBuf.length !== data.length * 2) {
        this.dataBuf = new this.type(data.length * 2);
        this.elementSize = 2;
      }
      for (i = _j = 0, _len1 = data.length; _j < _len1; i = ++_j) {
        v = data[i];
        this.dataBuf[i * 2 + 0] = v.x;
        this.dataBuf[i * 2 + 1] = v.y;
      }
    } else if (data[0] instanceof Vec3) {
      if (!this.dataBuf || this.dataBuf.length !== data.length * 3) {
        this.dataBuf = new this.type(data.length * 3);
        this.elementSize = 3;
      }
      for (i = _k = 0, _len2 = data.length; _k < _len2; i = ++_k) {
        v = data[i];
        this.dataBuf[i * 3 + 0] = v.x;
        this.dataBuf[i * 3 + 1] = v.y;
        this.dataBuf[i * 3 + 2] = v.z;
      }
    } else if (data[0] instanceof Vec4) {
      if (!this.dataBuf || this.dataBuf.length !== data.length * 4) {
        this.dataBuf = new this.type(data.length * 4);
        this.elementSize = 4;
      }
      for (i = _l = 0, _len3 = data.length; _l < _len3; i = ++_l) {
        v = data[i];
        this.dataBuf[i * 4 + 0] = v.x;
        this.dataBuf[i * 4 + 1] = v.y;
        this.dataBuf[i * 4 + 2] = v.z;
        this.dataBuf[i * 4 + 3] = v.w;
      }
    } else if (data[0] instanceof Color) {
      if (!this.dataBuf || this.dataBuf.length !== data.length * 4) {
        this.dataBuf = new this.type(data.length * 4);
        this.elementSize = 4;
      }
      for (i = _m = 0, _len4 = data.length; _m < _len4; i = ++_m) {
        v = data[i];
        this.dataBuf[i * 4 + 0] = v.r;
        this.dataBuf[i * 4 + 1] = v.g;
        this.dataBuf[i * 4 + 2] = v.b;
        this.dataBuf[i * 4 + 3] = v.a;
      }
    } else if (data[0].length === 2) {
      if (!this.dataBuf || this.dataBuf.length !== data.length * 2) {
        this.dataBuf = new this.type(data.length * 2);
        this.elementSize = 1;
      }
      for (i = _n = 0, _len5 = data.length; _n < _len5; i = ++_n) {
        e = data[i];
        this.dataBuf[i * 2 + 0] = e[0];
        this.dataBuf[i * 2 + 1] = e[1];
      }
    } else if (data[0].length >= 3) {
      numIndices = 0;
      for (_o = 0, _len6 = data.length; _o < _len6; _o++) {
        face = data[_o];
        if (face.length === 3) {
          numIndices += 3;
        }
        if (face.length === 4) {
          numIndices += 6;
        }
        if (face.length > 4) {
          throw 'FacePolygons are not supported in RenderableGeometry Buffers';
        }
      }
      if (!this.dataBuf || this.dataBuf.length !== numIndices) {
        this.dataBuf = new this.type(numIndices);
        this.elementSize = 1;
      }
      index = 0;
      for (_p = 0, _len7 = data.length; _p < _len7; _p++) {
        face = data[_p];
        if (face.length === 3) {
          this.dataBuf[index + 0] = face[0];
          this.dataBuf[index + 1] = face[1];
          this.dataBuf[index + 2] = face[2];
          index += 3;
        }
        if (face.length === 4) {
          this.dataBuf[index + 0] = face[0];
          this.dataBuf[index + 1] = face[1];
          this.dataBuf[index + 2] = face[3];
          this.dataBuf[index + 3] = face[3];
          this.dataBuf[index + 4] = face[1];
          this.dataBuf[index + 5] = face[2];
          index += 6;
        }
      }
    } else {
      console.log('Buffer.unknown type', data.name, data[0]);
    }
    this.gl.bindBuffer(this.target, this.handle);
    return this.gl.bufferData(this.target, this.dataBuf, this.usage);
  };

  return Buffer;

})();

module.exports = Buffer;

},{"pex-color":5,"pex-geom":7,"pex-glu":17}],20:[function(require,module,exports){
var sys = require('pex-sys');

var currentGLContext = null;

var Context = {
};

Object.defineProperty(Context, 'currentContext', {
  get: function() { 
    if (currentGLContext) {
      return currentGLContext;
    }
    else if (sys.Window.currentWindow) {
      return sys.Window.currentWindow.gl;
    }
    else {
      return null;
    }
  },
  set: function(gl) {
    currentGLContext = gl;
  },
  enumerable: true,
  configurable: true
});

module.exports = Context;
},{"pex-sys":40}],21:[function(require,module,exports){
var Context = require('./Context');

function Material(program, uniforms) {
  this.gl = Context.currentContext;
  this.program = program;
  this.uniforms = uniforms || {};
  this.prevUniforms = {};
}

Material.prototype.use = function () {
  this.program.use();
  var numTextures = 0;
  for (var name in this.uniforms) {
    if (this.program.uniforms[name]) {
      if (this.program.uniforms[name].type == this.gl.SAMPLER_2D || this.program.uniforms[name].type == this.gl.SAMPLER_CUBE) {
        this.gl.activeTexture(this.gl.TEXTURE0 + numTextures);
        if (this.uniforms[name].width > 0 && this.uniforms[name].height > 0) {
          this.gl.bindTexture(this.uniforms[name].target, this.uniforms[name].handle);
          this.program.uniforms[name](numTextures);
        }
        numTextures++;
      } else {
        var newValue = this.uniforms[name];
        var oldValue = this.prevUniforms[name];
        var newHash = null;
        if (oldValue !== null) {
          if (newValue.hash) {
            newHash = newValue.hash();
            if (newHash == oldValue) {
              continue;
            }
          } else if (newValue == oldValue) {
            continue;
          }
        }
        this.program.uniforms[name](this.uniforms[name]);
        this.prevUniforms[name] = newHash ? newHash : newValue;
      }
    }
  }
};

module.exports = Material;
},{"./Context":20}],22:[function(require,module,exports){
// Generated by CoffeeScript 1.7.1
var BoundingBox, Context, Mat4, Mesh, Quat, RenderableGeometry, Vec3, _ref;

Context = require('pex-glu').Context;

_ref = require('pex-geom'), Vec3 = _ref.Vec3, Quat = _ref.Quat, Mat4 = _ref.Mat4, BoundingBox = _ref.BoundingBox;

RenderableGeometry = require('./RenderableGeometry');

Mesh = (function() {
  function Mesh(geometry, material, options) {
    this.gl = Context.currentContext;
    this.geometry = geometry;
    this.material = material;
    options = options || {};
    this.primitiveType = options.primitiveType;
    if (this.primitiveType == null) {
      this.primitiveType = this.gl.TRIANGLES;
    }
    if (options.lines) {
      this.primitiveType = this.gl.LINES;
    }
    if (options.triangles) {
      this.primitiveType = this.gl.TRIANGLES;
    }
    if (options.points) {
      this.primitiveType = this.gl.POINTS;
    }
    this.position = Vec3.create(0, 0, 0);
    this.rotation = Quat.create();
    this.scale = Vec3.create(1, 1, 1);
    this.projectionMatrix = Mat4.create();
    this.viewMatrix = Mat4.create();
    this.modelWorldMatrix = Mat4.create();
    this.modelViewMatrix = Mat4.create();
    this.rotationMatrix = Mat4.create();
    this.normalMatrix = Mat4.create();
  }

  Mesh.prototype.draw = function(camera) {
    var num;
    if (this.geometry.isDirty()) {
      this.geometry.compile();
    }
    if (camera) {
      this.updateMatrices(camera);
      this.updateMatricesUniforms(this.material);
    }
    this.material.use();
    this.bindAttribs();
    if (this.geometry.faces && this.geometry.faces.length > 0 && this.primitiveType !== this.gl.LINES) {
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.geometry.faces.buffer.handle);
      this.gl.drawElements(this.primitiveType, this.geometry.faces.buffer.dataBuf.length, this.gl.UNSIGNED_SHORT, 0);
    } else if (this.geometry.edges && this.primitiveType === this.gl.LINES) {
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.geometry.edges.buffer.handle);
      this.gl.drawElements(this.primitiveType, this.geometry.edges.buffer.dataBuf.length, this.gl.UNSIGNED_SHORT, 0);
    } else if (this.geometry.vertices) {
      num = this.geometry.vertices.length;
      this.gl.drawArrays(this.primitiveType, 0, num);
    }
    return this.unbindAttribs();
  };

  Mesh.prototype.drawInstances = function(camera, instances) {
    var instance, num, _i, _j, _k, _len, _len1, _len2;
    if (this.geometry.isDirty()) {
      this.geometry.compile();
    }
    this.material.use();
    this.bindAttribs();
    if (this.geometry.faces && this.geometry.faces.length > 0 && !this.useEdges) {
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.geometry.faces.buffer.handle);
      for (_i = 0, _len = instances.length; _i < _len; _i++) {
        instance = instances[_i];
        if (camera) {
          this.updateMatrices(camera, instance);
          this.updateMatricesUniforms(this.material);
          this.updateUniforms(this.material, instance);
          this.material.use();
        }
        this.gl.drawElements(this.primitiveType, this.geometry.faces.buffer.dataBuf.length, this.gl.UNSIGNED_SHORT, 0);
      }
    } else if (this.geometry.edges && this.useEdges) {
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.geometry.edges.buffer.handle);
      for (_j = 0, _len1 = instances.length; _j < _len1; _j++) {
        instance = instances[_j];
        if (camera) {
          this.updateMatrices(camera, instance);
          this.updateMatricesUniforms(this.material);
          this.updateUniforms(this.material, instance);
          this.material.use();
        }
        this.gl.drawElements(this.primitiveType, this.geometry.edges.buffer.dataBuf.length, this.gl.UNSIGNED_SHORT, 0);
      }
    } else if (this.geometry.vertices) {
      num = this.geometry.vertices.length;
      for (_k = 0, _len2 = instances.length; _k < _len2; _k++) {
        instance = instances[_k];
        if (camera) {
          this.updateMatrices(camera, instance);
          this.updateMatricesUniforms(this.material);
          this.updateUniforms(this.material, instance);
          this.material.use();
        }
        this.gl.drawArrays(this.primitiveType, 0, num);
      }
    }
    return this.unbindAttribs();
  };

  Mesh.prototype.bindAttribs = function() {
    var attrib, name, program, _ref1, _results;
    program = this.material.program;
    _ref1 = this.geometry.attribs;
    _results = [];
    for (name in _ref1) {
      attrib = _ref1[name];
      attrib.location = this.gl.getAttribLocation(program.handle, attrib.name);
      if (attrib.location >= 0) {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, attrib.buffer.handle);
        this.gl.vertexAttribPointer(attrib.location, attrib.buffer.elementSize, this.gl.FLOAT, false, 0, 0);
        _results.push(this.gl.enableVertexAttribArray(attrib.location));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  Mesh.prototype.unbindAttribs = function() {
    var attrib, name, _ref1, _results;
    _ref1 = this.geometry.attribs;
    _results = [];
    for (name in _ref1) {
      attrib = _ref1[name];
      if (attrib.location >= 0) {
        _results.push(this.gl.disableVertexAttribArray(attrib.location));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  Mesh.prototype.resetAttribLocations = function() {
    var attrib, name, _results;
    _results = [];
    for (name in this.attributes) {
      attrib = this.attributes[name];
      _results.push(attrib.location = -1);
    }
    return _results;
  };

  Mesh.prototype.updateMatrices = function(camera, instance) {
    var position, rotation, scale;
    position = instance && instance.position ? instance.position : this.position;
    rotation = instance && instance.rotation ? instance.rotation : this.rotation;
    scale = instance && instance.scale ? instance.scale : this.scale;
    rotation.toMat4(this.rotationMatrix);
    this.modelWorldMatrix.identity().translate(position.x, position.y, position.z).mul(this.rotationMatrix).scale(scale.x, scale.y, scale.z);
    if (camera) {
      this.projectionMatrix.copy(camera.getProjectionMatrix());
      this.viewMatrix.copy(camera.getViewMatrix());
      this.modelViewMatrix.copy(camera.getViewMatrix()).mul(this.modelWorldMatrix);
      return this.normalMatrix.copy(this.modelViewMatrix).invert().transpose();
    }
  };

  Mesh.prototype.updateUniforms = function(material, instance) {
    var uniformName, uniformValue, _ref1, _results;
    _ref1 = instance.uniforms;
    _results = [];
    for (uniformName in _ref1) {
      uniformValue = _ref1[uniformName];
      _results.push(material.uniforms[uniformName] = uniformValue);
    }
    return _results;
  };

  Mesh.prototype.updateMatricesUniforms = function(material) {
    var materialUniforms, programUniforms;
    programUniforms = this.material.program.uniforms;
    materialUniforms = this.material.uniforms;
    if (programUniforms.projectionMatrix) {
      materialUniforms.projectionMatrix = this.projectionMatrix;
    }
    if (programUniforms.viewMatrix) {
      materialUniforms.viewMatrix = this.viewMatrix;
    }
    if (programUniforms.modelWorldMatrix) {
      materialUniforms.modelWorldMatrix = this.modelWorldMatrix;
    }
    if (programUniforms.modelViewMatrix) {
      materialUniforms.modelViewMatrix = this.modelViewMatrix;
    }
    if (programUniforms.normalMatrix) {
      return materialUniforms.normalMatrix = this.normalMatrix;
    }
  };

  Mesh.prototype.getMaterial = function() {
    return this.material;
  };

  Mesh.prototype.setMaterial = function(material) {
    this.material = material;
    return this.resetAttribLocations();
  };

  Mesh.prototype.getProgram = function() {
    return this.material.program;
  };

  Mesh.prototype.setProgram = function(program) {
    this.material.program = program;
    return this.resetAttribLocations();
  };

  Mesh.prototype.dispose = function() {
    return this.geometry.dispose();
  };

  Mesh.prototype.getBoundingBox = function() {
    if (!this.boundingBox) {
      this.updateBoundingBox();
    }
    return this.boundingBox;
  };

  Mesh.prototype.updateBoundingBox = function() {
    this.updateMatrices();
    return this.boundingBox = BoundingBox.fromPoints(this.geometry.vertices.map((function(_this) {
      return function(v) {
        return v.dup().transformMat4(_this.modelWorldMatrix);
      };
    })(this)));
  };

  return Mesh;

})();

module.exports = Mesh;

},{"./RenderableGeometry":27,"pex-geom":7,"pex-glu":17}],23:[function(require,module,exports){
// Generated by CoffeeScript 1.7.1
var Mat4, OrthographicCamera, Ray, Vec2, Vec3, Vec4, _ref;

_ref = require('pex-geom'), Vec2 = _ref.Vec2, Vec3 = _ref.Vec3, Vec4 = _ref.Vec4, Mat4 = _ref.Mat4, Ray = _ref.Ray;

OrthographicCamera = (function() {
  var projected;

  function OrthographicCamera(l, r, b, t, near, far, position, target, up) {
    this.left = l;
    this.right = r;
    this.bottom = b;
    this.top = t;
    this.near = near || 0.1;
    this.far = far || 100;
    this.position = position || Vec3.create(0, 0, 5);
    this.target = target || Vec3.create(0, 0, 0);
    this.up = up || Vec3.create(0, 1, 0);
    this.projectionMatrix = Mat4.create();
    this.viewMatrix = Mat4.create();
    this.updateMatrices();
  }

  OrthographicCamera.prototype.getFov = function() {
    return this.fov;
  };

  OrthographicCamera.prototype.getAspectRatio = function() {
    return this.aspectRatio;
  };

  OrthographicCamera.prototype.getNear = function() {
    return this.near;
  };

  OrthographicCamera.prototype.getFar = function() {
    return this.far;
  };

  OrthographicCamera.prototype.getPosition = function() {
    return this.position;
  };

  OrthographicCamera.prototype.getTarget = function() {
    return this.target;
  };

  OrthographicCamera.prototype.getUp = function() {
    return this.up;
  };

  OrthographicCamera.prototype.getViewMatrix = function() {
    return this.viewMatrix;
  };

  OrthographicCamera.prototype.getProjectionMatrix = function() {
    return this.projectionMatrix;
  };

  OrthographicCamera.prototype.setFov = function(fov) {
    this.fov = fov;
    return this.updateMatrices();
  };

  OrthographicCamera.prototype.setAspectRatio = function(ratio) {
    this.aspectRatio = ratio;
    return this.updateMatrices();
  };

  OrthographicCamera.prototype.setFar = function(far) {
    this.far = far;
    return this.updateMatrices();
  };

  OrthographicCamera.prototype.setNear = function(near) {
    this.near = near;
    return this.updateMatrices();
  };

  OrthographicCamera.prototype.setPosition = function(position) {
    this.position = position;
    return this.updateMatrices();
  };

  OrthographicCamera.prototype.setTarget = function(target) {
    this.target = target;
    return this.updateMatrices();
  };

  OrthographicCamera.prototype.setUp = function(up) {
    this.up = up;
    return this.updateMatrices();
  };

  OrthographicCamera.prototype.lookAt = function(target, eyePosition, up) {
    if (target) {
      this.target = target;
    }
    if (eyePosition) {
      this.position = eyePosition;
    }
    if (up) {
      this.up = up;
    }
    return this.updateMatrices();
  };

  OrthographicCamera.prototype.updateMatrices = function() {
    this.projectionMatrix.identity().ortho(this.left, this.right, this.bottom, this.top, this.near, this.far);
    return this.viewMatrix.identity().lookAt(this.position, this.target, this.up);
  };

  projected = Vec4.create();

  OrthographicCamera.prototype.getScreenPos = function(point, windowWidth, windowHeight) {
    var out;
    projected.set(point.x, point.y, point.z, 1.0);
    projected.transformMat4(this.viewMatrix);
    projected.transformMat4(this.projectionMatrix);
    out = Vec2.create().set(projected.x, projected.y);
    out.x /= projected.w;
    out.y /= projected.w;
    out.x = out.x * 0.5 + 0.5;
    out.y = out.y * 0.5 + 0.5;
    out.x *= windowWidth;
    out.y *= windowHeight;
    return out;
  };

  OrthographicCamera.prototype.getWorldRay = function(x, y, windowWidth, windowHeight) {
    var hNear, invViewMatrix, vOrigin, vTarget, wDirection, wNear, wOrigin, wTarget;
    x = (x - windowWidth / 2) / (windowWidth / 2);
    y = -(y - windowHeight / 2) / (windowHeight / 2);
    hNear = 2 * Math.tan(this.getFov() / 180 * Math.PI / 2) * this.getNear();
    wNear = hNear * this.getAspectRatio();
    x *= wNear / 2;
    y *= hNear / 2;
    vOrigin = new Vec3(0, 0, 0);
    vTarget = new Vec3(x, y, -this.getNear());
    invViewMatrix = this.getViewMatrix().dup().invert();
    wOrigin = vOrigin.dup().transformMat4(invViewMatrix);
    wTarget = vTarget.dup().transformMat4(invViewMatrix);
    wDirection = wTarget.dup().sub(wOrigin);
    return new Ray(wOrigin, wDirection);
  };

  return OrthographicCamera;

})();

module.exports = OrthographicCamera;

},{"pex-geom":7}],24:[function(require,module,exports){
// Generated by CoffeeScript 1.7.1
var Mat4, PerspectiveCamera, Ray, Vec2, Vec3, Vec4, _ref;

_ref = require('pex-geom'), Vec2 = _ref.Vec2, Vec3 = _ref.Vec3, Vec4 = _ref.Vec4, Mat4 = _ref.Mat4, Ray = _ref.Ray;

PerspectiveCamera = (function() {
  var projected;

  function PerspectiveCamera(fov, aspectRatio, near, far, position, target, up) {
    this.fov = fov || 60;
    this.aspectRatio = aspectRatio || 4 / 3;
    this.near = near || 0.1;
    this.far = far || 100;
    this.position = position || Vec3.create(0, 0, 5);
    this.target = target || Vec3.create(0, 0, 0);
    this.up = up || Vec3.create(0, 1, 0);
    this.projectionMatrix = Mat4.create();
    this.viewMatrix = Mat4.create();
    this.updateMatrices();
  }

  PerspectiveCamera.prototype.getFov = function() {
    return this.fov;
  };

  PerspectiveCamera.prototype.getAspectRatio = function() {
    return this.aspectRatio;
  };

  PerspectiveCamera.prototype.getNear = function() {
    return this.near;
  };

  PerspectiveCamera.prototype.getFar = function() {
    return this.far;
  };

  PerspectiveCamera.prototype.getPosition = function() {
    return this.position;
  };

  PerspectiveCamera.prototype.getTarget = function() {
    return this.target;
  };

  PerspectiveCamera.prototype.getUp = function() {
    return this.up;
  };

  PerspectiveCamera.prototype.getViewMatrix = function() {
    return this.viewMatrix;
  };

  PerspectiveCamera.prototype.getProjectionMatrix = function() {
    return this.projectionMatrix;
  };

  PerspectiveCamera.prototype.setFov = function(fov) {
    this.fov = fov;
    return this.updateMatrices();
  };

  PerspectiveCamera.prototype.setAspectRatio = function(ratio) {
    this.aspectRatio = ratio;
    return this.updateMatrices();
  };

  PerspectiveCamera.prototype.setFar = function(far) {
    this.far = far;
    return this.updateMatrices();
  };

  PerspectiveCamera.prototype.setNear = function(near) {
    this.near = near;
    return this.updateMatrices();
  };

  PerspectiveCamera.prototype.setPosition = function(position) {
    this.position = position;
    return this.updateMatrices();
  };

  PerspectiveCamera.prototype.setTarget = function(target) {
    this.target = target;
    return this.updateMatrices();
  };

  PerspectiveCamera.prototype.setUp = function(up) {
    this.up = up;
    return this.updateMatrices();
  };

  PerspectiveCamera.prototype.lookAt = function(target, eyePosition, up) {
    if (target) {
      this.target = target;
    }
    if (eyePosition) {
      this.position = eyePosition;
    }
    if (up) {
      this.up = up;
    }
    return this.updateMatrices();
  };

  PerspectiveCamera.prototype.updateMatrices = function() {
    this.projectionMatrix.identity().perspective(this.fov, this.aspectRatio, this.near, this.far);
    return this.viewMatrix.identity().lookAt(this.position, this.target, this.up);
  };

  projected = Vec4.create();

  PerspectiveCamera.prototype.getScreenPos = function(point, windowWidth, windowHeight) {
    var out;
    projected.set(point.x, point.y, point.z, 1.0);
    projected.transformMat4(this.viewMatrix);
    projected.transformMat4(this.projectionMatrix);
    out = Vec2.create().set(projected.x, projected.y);
    out.x /= projected.w;
    out.y /= projected.w;
    out.x = out.x * 0.5 + 0.5;
    out.y = out.y * 0.5 + 0.5;
    out.x *= windowWidth;
    out.y *= windowHeight;
    return out;
  };

  PerspectiveCamera.prototype.getWorldRay = function(x, y, windowWidth, windowHeight) {
    var hNear, invViewMatrix, vOrigin, vTarget, wDirection, wNear, wOrigin, wTarget;
    x = (x - windowWidth / 2) / (windowWidth / 2);
    y = -(y - windowHeight / 2) / (windowHeight / 2);
    hNear = 2 * Math.tan(this.getFov() / 180 * Math.PI / 2) * this.getNear();
    wNear = hNear * this.getAspectRatio();
    x *= wNear / 2;
    y *= hNear / 2;
    vOrigin = new Vec3(0, 0, 0);
    vTarget = new Vec3(x, y, -this.getNear());
    invViewMatrix = this.getViewMatrix().dup().invert();
    wOrigin = vOrigin.dup().transformMat4(invViewMatrix);
    wTarget = vTarget.dup().transformMat4(invViewMatrix);
    wDirection = wTarget.dup().sub(wOrigin);
    return new Ray(wOrigin, wDirection);
  };

  return PerspectiveCamera;

})();

module.exports = PerspectiveCamera;

},{"pex-geom":7}],25:[function(require,module,exports){
var Context = require('./Context');

var kVertexShaderPrefix = '' +
  '#ifdef GL_ES\n' +
  'precision highp float;\n' +
  '#endif\n' +
  '#define VERT\n';

var kFragmentShaderPrefix = '' +
  '#ifdef GL_ES\n' +
  '#ifdef GL_FRAGMENT_PRECISION_HIGH\n' +
  '  precision highp float;\n' +
  '#else\n' +
  '  precision mediump float;\n' +
  '#endif\n' +
  '#endif\n' +
  '#define FRAG\n';

function Program(vertSrc, fragSrc) {
  this.gl = Context.currentContext;
  this.handle = this.gl.createProgram();
  this.uniforms = {};
  this.attributes = {};
  this.addSources(vertSrc, fragSrc);
  this.ready = false;
  if (this.vertShader && this.fragShader) {
    this.link();
  }
}

Program.prototype.addSources = function(vertSrc, fragSrc) {
  if (fragSrc == null) {
    fragSrc = vertSrc;
  }
  if (vertSrc) {
    this.addVertexSource(vertSrc);
  }
  if (fragSrc) {
    return this.addFragmentSource(fragSrc);
  }
};

Program.prototype.addVertexSource = function(vertSrc) {
  this.vertShader = this.gl.createShader(this.gl.VERTEX_SHADER);
  this.gl.shaderSource(this.vertShader, kVertexShaderPrefix + vertSrc + '\n');
  this.gl.compileShader(this.vertShader);
  if (!this.gl.getShaderParameter(this.vertShader, this.gl.COMPILE_STATUS)) {
    throw this.gl.getShaderInfoLog(this.vertShader);
  }
};

Program.prototype.addFragmentSource = function(fragSrc) {
  this.fragShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
  this.gl.shaderSource(this.fragShader, kFragmentShaderPrefix + fragSrc + '\n');
  this.gl.compileShader(this.fragShader);
  if (!this.gl.getShaderParameter(this.fragShader, this.gl.COMPILE_STATUS)) {
    throw this.gl.getShaderInfoLog(this.fragShader);
  }
};

Program.prototype.link = function() {
  this.gl.attachShader(this.handle, this.vertShader);
  this.gl.attachShader(this.handle, this.fragShader);
  this.gl.linkProgram(this.handle);
  
  if (!this.gl.getProgramParameter(this.handle, this.gl.LINK_STATUS)) {
    throw this.gl.getProgramInfoLog(handle);
  }
  
  var numUniforms = this.gl.getProgramParameter(this.handle, this.gl.ACTIVE_UNIFORMS);
  
  for (var i=0; i<numUniforms; i++) {
    var info = this.gl.getActiveUniform(this.handle, i);
    if (info.size > 1) {
      for (var j=0; j<info.size; j++) {
        var arrayElementName = info.name.replace(/\[\d+\]/, '[' + j + ']');
        var location = this.gl.getUniformLocation(this.handle, arrayElementName);
        this.uniforms[arrayElementName] = Program.makeUniformSetter(this.gl, info.type, location);
      }
    } else {
      var location = this.gl.getUniformLocation(this.handle, info.name);
      this.uniforms[info.name] = Program.makeUniformSetter(this.gl, info.type, location);
    }
  }

  var numAttributes = this.gl.getProgramParameter(this.handle, this.gl.ACTIVE_ATTRIBUTES);
  for (var i=0; i<numAttributes; i++) {
    info = this.gl.getActiveAttrib(this.handle, i);
    var location = this.gl.getAttribLocation(this.handle, info.name);
    this.attributes[info.name] = location;
  }
  this.ready = true;
  return this;
};

Program.prototype.use = function() {
  if (Program.currentProgram !== this.handle) {
    Program.currentProgram = this.handle;
    return this.gl.useProgram(this.handle);
  }
};

Program.prototype.dispose = function() {
  this.gl.deleteShader(this.vertShader);
  this.gl.deleteShader(this.fragShader);
  return this.gl.deleteProgram(this.handle);
};

Program.load = function(url, callback, options) {
  var program;
  program = new Program();
  IO.loadTextFile(url, function(source) {
    console.log("Program.Compiling " + url);
    program.addSources(source);
    program.link();
    if (callback) {
      callback();
    }
    if (options && options.autoreload) {
      return IO.watchTextFile(url, function(source) {
        var e;
        try {
          program.gl.detachShader(program.handle, program.vertShader);
          program.gl.detachShader(program.handle, program.fragShader);
          program.addSources(source);
          return program.link();
        } catch (_error) {
          e = _error;
          console.log("Program.load : failed to reload " + url);
          return console.log(e);
        }
      });
    }
  });
  return program;
};

Program.makeUniformSetter = function(gl, type, location) {
  var setterFun = null;
  switch (type) {
    case gl.BOOL:
    case gl.INT:
      setterFun = function(value) {
        return gl.uniform1i(location, value);
      };
      break;
    case gl.SAMPLER_2D:
    case gl.SAMPLER_CUBE:
      setterFun = function(value) {
        return gl.uniform1i(location, value);
      };
      break;
    case gl.FLOAT:
      setterFun = function(value) {
        return gl.uniform1f(location, value);
      };
      break;
    case gl.FLOAT_VEC2:
      setterFun = function(v) {
        return gl.uniform2f(location, v.x, v.y);
      };
      break;
    case gl.FLOAT_VEC3:
      setterFun = function(v) {
        return gl.uniform3f(location, v.x, v.y, v.z);
      };
      break;
    case gl.FLOAT_VEC4:
      setterFun = function(v) {
        if (v.r != null) {
          gl.uniform4f(location, v.r, v.g, v.b, v.a);
        }
        if (v.x != null) {
          return gl.uniform4f(location, v.x, v.y, v.z, v.w);
        }
      };
      break;
    case gl.FLOAT_MAT4:
      var mv = new Float32Array(16);
      setterFun = function(m) {
        mv[0] = m.a11;
        mv[1] = m.a21;
        mv[2] = m.a31;
        mv[3] = m.a41;
        mv[4] = m.a12;
        mv[5] = m.a22;
        mv[6] = m.a32;
        mv[7] = m.a42;
        mv[8] = m.a13;
        mv[9] = m.a23;
        mv[10] = m.a33;
        mv[11] = m.a43;
        mv[12] = m.a14;
        mv[13] = m.a24;
        mv[14] = m.a34;
        mv[15] = m.a44;
        return gl.uniformMatrix4fv(location, false, mv);
      };
  }
  if (setterFun) {
    setterFun.type = type;
    return setterFun;
  } else {
    return function() {
      throw "Unknown uniform type: " + type;
    };
  }
};

module.exports = Program;
},{"./Context":20}],26:[function(require,module,exports){
var Context = require('./Context');
var Texture2D = require('./Texture2D');

function RenderTarget(width, height, options) {
  var gl = this.gl = Context.currentContext;
  this.width = width;
  this.height = height;
  this.oldBinding = gl.getParameter(gl.FRAMEBUFFER_BINDING);
  this.handle = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, this.handle);
  this.colorAttachements = [];
  if (options && options.depth) {
    var oldRenderBufferBinding = gl.getParameter(gl.RENDERBUFFER_BINDING);
    var depthBuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
    gl.getError();
    //reset error
    if (gl.DEPTH_COMPONENT24) {
      gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT24, this.width, this.height);
    }
    if (gl.getError() || !gl.DEPTH_COMPONENT24) {
      //24 bit depth buffer might be not available, trying with 16
      gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.width, this.height);
    }
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);
    this.depthBuffer = depthBuffer;
    gl.bindRenderbuffer(gl.RENDERBUFFER, oldRenderBufferBinding);
  }
  var texture = Texture2D.create(width, height, options);
  texture.bind();
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + this.colorAttachements.length, texture.target, texture.handle, 0);
  this.colorAttachements.push(texture);
  gl.bindFramebuffer(gl.FRAMEBUFFER, this.oldBinding);
  this.oldBinding = null;
}

RenderTarget.prototype.bind = function () {
  var gl = this.gl;
  this.oldBinding = gl.getParameter(gl.FRAMEBUFFER_BINDING);
  gl.bindFramebuffer(gl.FRAMEBUFFER, this.handle);
};

RenderTarget.prototype.bindAndClear = function () {
  var gl = this.gl;
  this.bind();
  gl.clearColor(0, 0, 0, 1);
  if (this.depthBuffer)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  else
    gl.clear(gl.COLOR_BUFFER_BIT);
};

RenderTarget.prototype.unbind = function () {
  var gl = this.gl;
  gl.bindFramebuffer(gl.FRAMEBUFFER, this.oldBinding);
  this.oldBinding = null;
};

RenderTarget.prototype.getColorAttachement = function (index) {
  index = index || 0;
  return this.colorAttachements[index];
};

 module.exports = RenderTarget;
},{"./Context":20,"./Texture2D":30}],27:[function(require,module,exports){
// Generated by CoffeeScript 1.7.1
var Buffer, Context, Geometry, indexTypes;

Geometry = require('pex-geom').Geometry;

Context = require('./Context');

Buffer = require('./Buffer');

indexTypes = ['faces', 'edges', 'indices'];

Geometry.prototype.compile = function() {
  var attrib, attribName, indexName, usage, _i, _len, _ref, _results;
  if (this.gl == null) {
    this.gl = Context.currentContext;
  }
  _ref = this.attribs;
  for (attribName in _ref) {
    attrib = _ref[attribName];
    if (!attrib.buffer) {
      usage = attrib.dynamic ? this.gl.DYNAMIC_DRAW : this.gl.STATIC_DRAW;
      attrib.buffer = new Buffer(this.gl.ARRAY_BUFFER, Float32Array, null, usage);
      attrib.dirty = true;
    }
    if (attrib.dirty) {
      attrib.buffer.update(attrib);
      attrib.dirty = false;
    }
  }
  _results = [];
  for (_i = 0, _len = indexTypes.length; _i < _len; _i++) {
    indexName = indexTypes[_i];
    if (this[indexName]) {
      if (!this[indexName].buffer) {
        usage = this[indexName].dynamic ? this.gl.DYNAMIC_DRAW : this.gl.STATIC_DRAW;
        this[indexName].buffer = new Buffer(this.gl.ELEMENT_ARRAY_BUFFER, Uint16Array, null, usage);
        this[indexName].dirty = true;
      }
      if (this[indexName].dirty) {
        this[indexName].buffer.update(this[indexName]);
        _results.push(this[indexName].dirty = false);
      } else {
        _results.push(void 0);
      }
    } else {
      _results.push(void 0);
    }
  }
  return _results;
};

Geometry.prototype.dispose = function() {
  var attrib, attribName, indexName, _i, _len, _ref, _results;
  _ref = this.attribs;
  for (attribName in _ref) {
    attrib = _ref[attribName];
    if (attrib && attrib.buffer) {
      attrib.buffer.dispose();
    }
  }
  _results = [];
  for (_i = 0, _len = indexTypes.length; _i < _len; _i++) {
    indexName = indexTypes[_i];
    if (this[indexName] && this[indexName].buffer) {
      _results.push(this[indexName].buffer.dispose());
    } else {
      _results.push(void 0);
    }
  }
  return _results;
};

module.exports = {};

},{"./Buffer":19,"./Context":20,"pex-geom":7}],28:[function(require,module,exports){
(function (__dirname){
var geom = require('pex-geom');
var Vec2 = geom.Vec2;
var Geometry = geom.Geometry;
var Program = require('./Program');
var Material = require('./Material');
var Mesh = require('./Mesh');
var fs = require('fs');

var ScreenImageGLSL = "#ifdef VERT\n\nattribute vec2 position;\nattribute vec2 texCoord;\nuniform vec2 screenSize;\nuniform vec2 pixelPosition;\nuniform vec2 pixelSize;\nvarying vec2 vTexCoord;\n\nvoid main() {\n  float tx = position.x * 0.5 + 0.5; //-1 -> 0, 1 -> 1\n  float ty = -position.y * 0.5 + 0.5; //-1 -> 1, 1 -> 0\n  //(x + 0)/sw * 2 - 1, (x + w)/sw * 2 - 1\n  float x = (pixelPosition.x + pixelSize.x * tx)/screenSize.x * 2.0 - 1.0;  //0 -> -1, 1 -> 1\n  //1.0 - (y + h)/sh * 2, 1.0 - (y + h)/sh * 2\n  float y = 1.0 - (pixelPosition.y + pixelSize.y * ty)/screenSize.y * 2.0;  //0 -> 1, 1 -> -1\n  gl_Position = vec4(x, y, 0.0, 1.0);\n  vTexCoord = texCoord;\n}\n\n#endif\n\n#ifdef FRAG\n\nvarying vec2 vTexCoord;\nuniform sampler2D image;\nuniform float alpha;\n\nvoid main() {\n  gl_FragColor = texture2D(image, vTexCoord);\n  gl_FragColor.a *= alpha;\n}\n\n#endif";

function ScreenImage(image, x, y, w, h, screenWidth, screenHeight) {
  x = x !== undefined ? x : 0;
  y = y !== undefined ? y : 0;
  w = w !== undefined ? w : 1;
  h = h !== undefined ? h : 1;
  screenWidth = screenWidth !== undefined ? screenWidth : 1;
  screenHeight = screenHeight !== undefined ? screenHeight : 1;
  this.image = image;
  var program = new Program(ScreenImageGLSL);
  var uniforms = {
    screenSize: Vec2.create(screenWidth, screenHeight),
    pixelPosition: Vec2.create(x, y),
    pixelSize: Vec2.create(w, h),
    alpha: 1
  };
  if (image) {
    uniforms.image = image;
  }
  var material = new Material(program, uniforms);
  var vertices = [
    new Vec2(-1, 1),
    new Vec2(1, 1),
    new Vec2(1, -1),
    new Vec2(-1, -1)
  ];
  var texCoords = [
    new Vec2(0, 1),
    new Vec2(1, 1),
    new Vec2(1, 0),
    new Vec2(0, 0)
  ];
  var geometry = new Geometry({
    vertices: vertices,
    texCoords: texCoords
  });
  // 0----1  0,1   1,1
  // | \  |      u
  // |  \ |      v
  // 3----2  0,0   0,1
  geometry.faces.push([0, 2, 1]);
  geometry.faces.push([0, 3, 2]);
  this.mesh = new Mesh(geometry, material);
}

ScreenImage.prototype.setAlpha = function (alpha) {
  this.mesh.material.uniforms.alpha = alpha;
};

ScreenImage.prototype.setPosition = function (position) {
  this.mesh.material.uniforms.pixelPosition = position;
};

ScreenImage.prototype.setSize = function (size) {
  this.mesh.material.uniforms.pixelSize = size;
};

ScreenImage.prototype.setWindowSize = function (size) {
  this.mesh.material.uniforms.windowSize = size;
};

ScreenImage.prototype.setBounds = function (bounds) {
  this.mesh.material.uniforms.pixelPosition.x = bounds.x;
  this.mesh.material.uniforms.pixelPosition.y = bounds.y;
  this.mesh.material.uniforms.pixelSize.x = bounds.width;
  this.mesh.material.uniforms.pixelSize.y = bounds.height;
};

ScreenImage.prototype.setImage = function (image) {
  this.image = image;
  this.mesh.material.uniforms.image = image;
};

ScreenImage.prototype.draw = function (image, program) {
  var oldImage = null;
  if (image) {
    oldImage = this.mesh.material.uniforms.image;
    this.mesh.material.uniforms.image = image;
  }
  var oldProgram = null;
  if (program) {
    oldProgram = this.mesh.getProgram();
    this.mesh.setProgram(program);
  }
  this.mesh.draw();
  if (oldProgram) {
    this.mesh.setProgram(oldProgram);
  }
  if (oldImage) {
    this.mesh.material.uniforms.image = oldImage;
  }
};

module.exports = ScreenImage;
}).call(this,"/../node_modules/pex-glu/lib")
},{"./Material":21,"./Mesh":22,"./Program":25,"fs":2,"pex-geom":7}],29:[function(require,module,exports){
var Context = require('./Context');

function Texture(target) {
  if (target) {
    this.init(target);
  }
}

Texture.RGBA32F = 34836;

Texture.prototype.init = function(target) {
  this.gl = Context.currentContext;
  this.target = target;
  this.handle = this.gl.createTexture();
};

//### bind ( unit )
//Binds the texture to the current GL context.
//`unit` - texture unit in which to place the texture *{ Number/Int }* = 0

Texture.prototype.bind = function(unit) {
  unit = unit ? unit : 0;
  this.gl.activeTexture(this.gl.TEXTURE0 + unit);
  this.gl.bindTexture(this.target, this.handle);
};

module.exports = Texture;
},{"./Context":20}],30:[function(require,module,exports){
var sys = require('pex-sys');
var IO = sys.IO;
var Context = require('./Context');
var Texture = require('./Texture');

function Texture2D() {
  this.gl = Context.currentContext;
  Texture.call(this, this.gl.TEXTURE_2D);
}

Texture2D.prototype = Object.create(Texture.prototype);

Texture2D.create = function(w, h, options) {
  options = options || {};
  var texture = new Texture2D();
  texture.bind();
  var gl = texture.gl;
  var isWebGL = gl.getExtension ? true : false;
  var internalFloatFormat = isWebGL ? gl.RGBA : 34836;
  if (options.bpp == 32) {
    gl.texImage2D(gl.TEXTURE_2D, 0, internalFloatFormat, w, h, 0, gl.RGBA, gl.FLOAT, null);
  }
  else {
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  }
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.bindTexture(gl.TEXTURE_2D, null);
  texture.width = w;
  texture.height = h;
  texture.target = gl.TEXTURE_2D;
  return texture;
};

Texture2D.prototype.bind = function(unit) {
  unit = unit ? unit : 0;
  this.gl.activeTexture(this.gl.TEXTURE0 + unit);
  this.gl.bindTexture(this.gl.TEXTURE_2D, this.handle);
};

Texture2D.genNoise = function(w, h) {
  w = w || 256;
  h = h || 256;
  var gl = Context.currentContext;
  var texture = new Texture2D();
  texture.bind();
  //TODO: should check unpack alignment as explained here https://groups.google.com/forum/#!topic/webgl-dev-list/wuUZP7iTr9Q
  var b = new ArrayBuffer(w * h * 2);
  var pixels = new Uint8Array(b);
  for (var y = 0; y < h; y++) {
    for (var x = 0; x < w; x++) {
      pixels[y * w + x] = Math.floor(Math.random() * 255);
    }
  }
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, w, h, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, pixels);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.bindTexture(gl.TEXTURE_2D, null);
  texture.width = w;
  texture.height = h;
  return texture;
};

Texture2D.genNoiseRGBA = function(w, h) {
  w = w || 256;
  h = h || 256;
  var gl = Context.currentContext;
  var handle = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, handle);
  var b = new ArrayBuffer(w * h * 4);
  var pixels = new Uint8Array(b);
  for (var y = 0; y < h; y++) {
    for (var x = 0; x < w; x++) {
      pixels[(y * w + x) * 4 + 0] = y;
      pixels[(y * w + x) * 4 + 1] = Math.floor(255 * Math.random());
      pixels[(y * w + x) * 4 + 2] = Math.floor(255 * Math.random());
      pixels[(y * w + x) * 4 + 3] = Math.floor(255 * Math.random());
    }
  }
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.bindTexture(gl.TEXTURE_2D, null);
  var texture = new Texture2D();
  texture.handle = handle;
  texture.width = w;
  texture.height = h;
  texture.target = gl.TEXTURE_2D;
  texture.gl = gl;
  return texture;
};

Texture2D.load = function(src, callback) {
  var gl = Context.currentContext;
  var texture = new Texture2D();
  texture.handle = gl.createTexture();
  texture.target = gl.TEXTURE_2D;
  texture.gl = gl;
  IO.loadImageData(gl, texture, texture.target, src, true, function(image) {
    if (!image) {
      texture.dispose();
      var noise = Texture2D.getNoise();
      texture.handle = noise.handle;
      texture.width = noise.width;
      texture.height = noise.height;
    }
    gl.texParameteri(texture.target, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(texture.target, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(texture.target, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(texture.target, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindTexture(texture.target, null);
    texture.width = image.width;
    texture.height = image.height;
    if (callback) {
      callback(texture);
    }
  });
  return texture;
};

Texture2D.prototype.dispose = function() {
  if (this.handle) {
    this.gl.deleteTexture(this.handle);
    this.handle = null;
  }
};

module.exports = Texture2D;
},{"./Context":20,"./Texture":29,"pex-sys":40}],31:[function(require,module,exports){
var sys = require('pex-sys');
var IO = sys.IO;
var Context = require('./Context');
var Texture = require('./Texture');
  
//### TextureCube ( )
//Does nothing, use *load()* method instead.
function TextureCube() {
  this.gl = Context.currentContext;
  Texture.call(this, this.gl.TEXTURE_CUBE_MAP);
}

TextureCube.prototype = Object.create(Texture.prototype);

//### load ( src )
//Load texture from file (in Plask) or url (in the web browser).
//
//`src` - path to file or url (e.g. *path/file_####.jpg*) *{ String }*
//
//Returns the loaded texture *{ Texture2D }*
//
//*Note* the path or url must contain #### that will be replaced by
//id (e.g. *posx*) of the cube side*
//
//*Note: In Plask the texture is ready immediately, in the web browser it's
//first black until the file is loaded and texture can be populated with the image data.*
TextureCube.load = function (src) {
  var gl = Context.currentContext;
  var texture = new TextureCube();
  var cubeMapTargets = [
    gl.TEXTURE_CUBE_MAP_POSITIVE_X,
    'posx',
    gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
    'negx',
    gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
    'posy',
    gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
    'negy',
    gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
    'posz',
    gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
    'negz'
  ];
  gl.bindTexture(texture.target, texture.handle);
  gl.texParameteri(texture.target, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(texture.target, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(texture.target, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(texture.target, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  for (var i = 0; i < cubeMapTargets.length; i += 2) {
    IO.loadImageData(gl, texture, cubeMapTargets[i], src.replace('####', cubeMapTargets[i + 1]), false, function (image) {
      texture.width = image.width;
      texture.height = image.height;
    });
  }
  return texture;
};

//### dispose ( )
//Frees the texture data.
TextureCube.prototype.dispose = function () {
  if (this.handle) {
    this.gl.deleteTexture(this.handle);
    this.handle = null;
  }
};

module.exports = TextureCube;

},{"./Context":20,"./Texture":29,"pex-sys":40}],32:[function(require,module,exports){
var Context = require('./Context');

module.exports.getCurrentContext = function() {
  return Context.currentContext;
}

module.exports.clearColor = function(color) {
  var gl = Context.currentContext;
  if (color)
    gl.clearColor(color.r, color.g, color.b, color.a);
  gl.clear(gl.COLOR_BUFFER_BIT);
  return this;
};

module.exports.clearColorAndDepth = function(color) {
  var gl = Context.currentContext;
  color = color || Core.Color.Black;
  gl.clearColor(color.r, color.g, color.b, color.a);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  return this;
};

module.exports.enableDepthWriteAndRead = function(depthWrite, depthRead) {
  if (depthWrite === undefined) depthWrite = true;
  if (depthRead === undefined) depthRead = true;
  var gl = Context.currentContext;

  if (depthWrite) gl.depthMask(1);
  else gl.depthMask(0);

  if (depthRead) gl.enable(gl.DEPTH_TEST);
  else gl.disable(gl.DEPTH_TEST);

  return this;
};

module.exports.enableAdditiveBlending = function() {
  return this.enableBlending("ONE", "ONE");
};

module.exports.enableAlphaBlending = function(src, dst) {
  return this.enableBlending("SRC_ALPHA", "ONE_MINUS_SRC_ALPHA");
};

module.exports.enableBlending = function(src, dst) {
  var gl = Context.currentContext;
  if (src === false) {
    gl.disable(gl.BLEND);
    return this;
  }
  gl.enable(gl.BLEND);
  gl.blendFunc(gl[src], gl[dst]);
  return this;
};

module.exports.viewport = function(x, y, w, h) {
  var gl = this.gl;
  gl.viewport(x, y, w, h);
  return this;
};

module.exports.cullFace = function(enabled) {
  enabled = (enabled !== undefined) ? enabled : true
  var gl = Context.currentContext;
  if (enabled)
    gl.enable(gl.CULL_FACE);
  else
    gl.disable(gl.CULL_FACE);
  gl.cullFace(gl.BACK);
  return this;
};

module.exports.lineWidth = function(width) {
  var gl = Context.currentContext;
  gl.lineWidth(width);
  return this;
}
},{"./Context":20}],33:[function(require,module,exports){
module.exports.SolidColor = require('./lib/SolidColor');
module.exports.ShowNormals = require('./lib/ShowNormals');
module.exports.Textured = require('./lib/Textured');
module.exports.TexturedCubeMap = require('./lib/TexturedCubeMap');
module.exports.SkyBox = require('./lib/SkyBox');
},{"./lib/ShowNormals":34,"./lib/SkyBox":35,"./lib/SolidColor":36,"./lib/Textured":37,"./lib/TexturedCubeMap":38}],34:[function(require,module,exports){
(function (__dirname){
var glu = require('pex-glu');
var color = require('pex-color');
var Context = glu.Context;
var Material = glu.Material;
var Program = glu.Program;
var Color = color.Color;
var merge = require('merge');
var fs = require('fs');

var ShowNormalsGLSL = "#ifdef VERT\n\nuniform mat4 projectionMatrix;\nuniform mat4 modelViewMatrix;\nuniform float pointSize;\nattribute vec3 position;\nattribute vec3 normal;\nvarying vec4 vColor;\nvoid main() {\n  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n  gl_PointSize = pointSize;\n  vColor = vec4(normal * 0.5 + 0.5, 1.0);\n}\n\n#endif\n\n#ifdef FRAG\n\nvarying vec4 vColor;\n\nvoid main() {\n  gl_FragColor = vColor;\n}\n\n#endif\n";

function ShowNormals(uniforms) {
  this.gl = Context.currentContext;
  var program = new Program(ShowNormalsGLSL);
  var defaults = { pointSize: 1 };
  uniforms = merge(defaults, uniforms);
  Material.call(this, program, uniforms);
}

ShowNormals.prototype = Object.create(Material.prototype);

module.exports = ShowNormals;
}).call(this,"/../node_modules/pex-materials/lib")
},{"fs":2,"merge":39,"pex-color":5,"pex-glu":17}],35:[function(require,module,exports){
(function (__dirname){
var glu = require('pex-glu');
var color = require('pex-color');
var Context = glu.Context;
var Material = glu.Material;
var Program = glu.Program;
var Color = color.Color;
var merge = require('merge');
var fs = require('fs');

var SkyBoxGLSL = "#ifdef VERT\n\nuniform mat4 projectionMatrix;\nuniform mat4 modelViewMatrix;\nattribute vec3 position;\nattribute vec3 normal;\nvarying vec3 vNormal;\n\nvoid main() {\n  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n  vNormal = position * vec3(1.0, 1.0, 1.0);\n}\n\n#endif\n\n#ifdef FRAG\n\nuniform samplerCube texture;\nvarying vec3 vNormal;\n\nvoid main() {\n  vec3 N = normalize(vNormal);\n  gl_FragColor = textureCube(texture, N);\n}\n\n#endif\n";

function TexturedCubeMap(uniforms) {
  this.gl = Context.currentContext;
  var program = new Program(SkyBoxGLSL);
  var defaults = {};
  uniforms = merge(defaults, uniforms);
  Material.call(this, program, uniforms);
}

TexturedCubeMap.prototype = Object.create(Material.prototype);

module.exports = TexturedCubeMap;

}).call(this,"/../node_modules/pex-materials/lib")
},{"fs":2,"merge":39,"pex-color":5,"pex-glu":17}],36:[function(require,module,exports){
(function (__dirname){
var glu = require('pex-glu');
var color = require('pex-color');
var Context = glu.Context;
var Material = glu.Material;
var Program = glu.Program;
var Color = color.Color;
var merge = require('merge');
var fs = require('fs');

var SolidColorGLSL = "#ifdef VERT\n\nuniform mat4 projectionMatrix;\nuniform mat4 modelViewMatrix;\nuniform float pointSize;\nattribute vec3 position;\n\nvoid main() {\n  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n  gl_PointSize = pointSize;\n}\n\n#endif\n\n#ifdef FRAG\n\nuniform vec4 color;\nuniform bool premultiplied;\n\nvoid main() {\n  gl_FragColor = color;\n  if (premultiplied) {\n    gl_FragColor.rgb *= color.a;\n  }\n}\n\n#endif\n";

function SolidColor(uniforms) {
  this.gl = Context.currentContext;
  var program = new Program(SolidColorGLSL);
  var defaults = {
    color: Color.create(1, 1, 1, 1),
    pointSize: 1,
    premultiplied: 0
  };
  uniforms = merge(defaults, uniforms);
  Material.call(this, program, uniforms);
}

SolidColor.prototype = Object.create(Material.prototype);

module.exports = SolidColor;
}).call(this,"/../node_modules/pex-materials/lib")
},{"fs":2,"merge":39,"pex-color":5,"pex-glu":17}],37:[function(require,module,exports){
(function (__dirname){
var glu = require('pex-glu');
var color = require('pex-color');
var Context = glu.Context;
var Material = glu.Material;
var Program = glu.Program;
var Color = color.Color;
var merge = require('merge');
var fs = require('fs');

var TexturedGLSL = "#ifdef VERT\n\nuniform mat4 projectionMatrix;\nuniform mat4 modelViewMatrix;\nattribute vec3 position;\nattribute vec2 texCoord;\nvarying vec2 vTexCoord;\n\nvoid main() {\n  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n  vTexCoord = texCoord;\n}\n\n#endif\n\n#ifdef FRAG\n\nuniform sampler2D texture;\nvarying vec2 vTexCoord;\n\nvoid main() {\n  gl_FragColor = texture2D(texture, vTexCoord);\n}\n\n#endif\n";

function Textured(uniforms) {
  this.gl = Context.currentContext;
  var program = new Program(TexturedGLSL);
  var defaults = {};
  uniforms = merge(defaults, uniforms);
  Material.call(this, program, uniforms);
}

Textured.prototype = Object.create(Material.prototype);

module.exports = Textured;

}).call(this,"/../node_modules/pex-materials/lib")
},{"fs":2,"merge":39,"pex-color":5,"pex-glu":17}],38:[function(require,module,exports){
(function (__dirname){
var glu = require('pex-glu');
var color = require('pex-color');
var Context = glu.Context;
var Material = glu.Material;
var Program = glu.Program;
var Color = color.Color;
var merge = require('merge');
var fs = require('fs');

var TexturedCubeMapGLSL = "#ifdef VERT\n\nuniform mat4 projectionMatrix;\nuniform mat4 modelViewMatrix;\nattribute vec3 position;\nattribute vec3 normal;\nvarying vec3 vTexCoord;\n\nvoid main() {\n  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n  vTexCoord = normal;\n}\n\n#endif\n\n#ifdef FRAG\n\nuniform samplerCube texture;\nvarying vec3 vTexCoord;\n\nvoid main() {\n  gl_FragColor = textureCube(texture, vTexCoord);\n}\n\n#endif\n";

function TexturedCubeMap(uniforms) {
  this.gl = Context.currentContext;
  var program = new Program(TexturedCubeMapGLSL);
  var defaults = {};
  uniforms = merge(defaults, uniforms);
  Material.call(this, program, uniforms);
}

TexturedCubeMap.prototype = Object.create(Material.prototype);

module.exports = TexturedCubeMap;

}).call(this,"/../node_modules/pex-materials/lib")
},{"fs":2,"merge":39,"pex-color":5,"pex-glu":17}],39:[function(require,module,exports){
/*!
 * @name JavaScript/NodeJS Merge v1.1.2
 * @author yeikos
 * @repository https://github.com/yeikos/js.merge

 * Copyright 2013 yeikos - MIT license
 * https://raw.github.com/yeikos/js.merge/master/LICENSE
 */

;(function(isNode) {

	function merge() {

		var items = Array.prototype.slice.call(arguments),
			result = items.shift(),
			deep = (result === true),
			size = items.length,
			item, index, key;

		if (deep || typeOf(result) !== 'object')

			result = {};

		for (index=0;index<size;++index)

			if (typeOf(item = items[index]) === 'object')

				for (key in item)

					result[key] = deep ? clone(item[key]) : item[key];

		return result;

	}

	function clone(input) {

		var output = input,
			type = typeOf(input),
			index, size;

		if (type === 'array') {

			output = [];
			size = input.length;

			for (index=0;index<size;++index)

				output[index] = clone(input[index]);

		} else if (type === 'object') {

			output = {};

			for (index in input)

				output[index] = clone(input[index]);

		}

		return output;

	}

	function typeOf(input) {

		return ({}).toString.call(input).match(/\s([\w]+)/)[1].toLowerCase();

	}

	if (isNode) {

		module.exports = merge;

	} else {

		window.merge = merge;

	}

})(typeof module === 'object' && module && typeof module.exports === 'object' && module.exports);
},{}],40:[function(require,module,exports){
module.exports.Platform = require('./lib/Platform');
module.exports.Window = require('./lib/Window');
module.exports.Time = require('./lib/Time');
module.exports.IO = require('./lib/IO');
},{"./lib/IO":42,"./lib/Platform":43,"./lib/Time":44,"./lib/Window":45}],41:[function(require,module,exports){
var Platform = require('./Platform');

var requestAnimFrameFps = 60;

if (Platform.isBrowser) {
  window.requestAnimFrame = function () {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (callback, element) {
      window.setTimeout(callback, 1000 / requestAnimFrameFps);
    };
  }();
}
var eventListeners = [];
function fireEvent(eventType, event) {
  for (var i = 0; i < eventListeners.length; i++) {
    if (eventListeners[i].eventType == eventType) {
      eventListeners[i].handler(event);
    }
  }
}
function registerEvents(canvas) {
  makeMouseDownHandler(canvas);
  makeMouseUpHandler(canvas);
  makeMouseDraggedHandler(canvas);
  makeMouseMovedHandler(canvas);
  makeScrollWheelHandler(canvas);
  makeTouchDownHandler(canvas);
  makeTouchUpHandler(canvas);
  makeTouchMoveHandler(canvas);
  makeKeyDownHandler(canvas);
}
function makeMouseDownHandler(canvas) {
  canvas.addEventListener('mousedown', function (e) {
    fireEvent('leftMouseDown', {
      x: (e.offsetX || e.layerX || e.clientX - e.target.offsetLeft) * window.devicePixelRatio,
      y: (e.offsetY || e.layerY || e.clientY - e.target.offsetTop) * window.devicePixelRatio,
      option: e.altKey,
      shift: e.shiftKey,
      control: e.ctrlKey
    });
  });
}
function makeMouseUpHandler(canvas) {
  canvas.addEventListener('mouseup', function (e) {
    fireEvent('leftMouseUp', {
      x: (e.offsetX || e.layerX || e.clientX - e.target.offsetLeft) * window.devicePixelRatio,
      y: (e.offsetY || e.layerY || e.clientY - e.target.offsetTop) * window.devicePixelRatio,
      option: e.altKey,
      shift: e.shiftKey,
      control: e.ctrlKey
    });
  });
}
function makeMouseDraggedHandler(canvas) {
  var down = false;
  var px = 0;
  var py = 0;
  canvas.addEventListener('mousedown', function (e) {
    down = true;
    px = (e.offsetX || e.layerX || e.clientX - e.target.offsetLeft) * window.devicePixelRatio;
    py = (e.offsetY || e.layerY || e.clientY - e.target.offsetTop) * window.devicePixelRatio;
  });
  canvas.addEventListener('mouseup', function (e) {
    down = false;
  });
  canvas.addEventListener('mousemove', function (e) {
    if (down) {
      var x = (e.offsetX || e.layerX || e.clientX - e.target.offsetLeft) * window.devicePixelRatio;
      var y = (e.offsetY || e.layerY || e.clientY - e.target.offsetTop) * window.devicePixelRatio;
      fireEvent('mouseDragged', {
        x: x,
        y: y,
        dx: x - px,
        dy: y - py,
        option: e.altKey,
        shift: e.shiftKey,
        control: e.ctrlKey
      });
      px = x;
      py = y;
    }
  });
}
function makeMouseMovedHandler(canvas) {
  canvas.addEventListener('mousemove', function (e) {
    fireEvent('mouseMoved', {
      x: (e.offsetX || e.layerX || e.clientX - e.target.offsetLeft) * window.devicePixelRatio,
      y: (e.offsetY || e.layerY || e.clientY - e.target.offsetTop) * window.devicePixelRatio,
      option: e.altKey,
      shift: e.shiftKey,
      control: e.ctrlKey
    });
  });
}
function makeScrollWheelHandler(canvas) {
  var mousewheelevt = /Firefox/i.test(navigator.userAgent) ? 'DOMMouseScroll' : 'mousewheel';
  document.addEventListener(mousewheelevt, function (e) {
    fireEvent('scrollWheel', {
      x: (e.offsetX || e.layerX) * window.devicePixelRatio,
      y: (e.offsetY || e.layerY) * window.devicePixelRatio,
      dy: e.wheelDelta / 10 || -e.detail / 10,
      option: e.altKey,
      shift: e.shiftKey,
      control: e.ctrlKey
    });
  });
}
var lastTouch = null;
function makeTouchDownHandler(canvas) {
  canvas.addEventListener('touchstart', function (e) {
    lastTouch = {
      clientX: e.touches[0].clientX * window.devicePixelRatio,
      clientY: e.touches[0].clientY * window.devicePixelRatio
    };
    var touches = e.touches.map(function(touch) {
      touch.x = touch.clientX * window.devicePixelRatio;
      touch.y = touch.clientY * window.devicePixelRatio;
      return touch;
    });
    fireEvent('leftMouseDown', {
      x: e.touches[0].clientX * window.devicePixelRatio,
      y: e.touches[0].clientY * window.devicePixelRatio,
      option: false,
      shift: false,
      control: false,
      touches: touches
    });
  });
}
function makeTouchUpHandler(canvas) {
  canvas.addEventListener('touchend', function(e) {
    var touches = e.touches.map(function(touch) {
      touch.x = touch.clientX * window.devicePixelRatio;
      touch.y = touch.clientY * window.devicePixelRatio;
      return touch;
    });
    fireEvent('leftMouseUp', {
      x: lastTouch ? lastTouch.clientX : 0,
      y: lastTouch ? lastTouch.clientY : 0,
      option: false,
      shift: false,
      control: false,
      touches: touches
    });
    lastTouch = null;
  });
}
function makeTouchMoveHandler(canvas) {
  canvas.addEventListener('touchmove', function (e) {
    lastTouch = {
      clientX: e.touches[0].clientX * window.devicePixelRatio,
      clientY: e.touches[0].clientY * window.devicePixelRatio
    };
    var touches = e.touches.map(function(touch) {
      touch.x = touch.clientX * window.devicePixelRatio;
      touch.y = touch.clientY * window.devicePixelRatio;
      return touch;
    });
    fireEvent('mouseDragged', {
      x: e.touches[0].clientX * window.devicePixelRatio,
      y: e.touches[0].clientY * window.devicePixelRatio,
      option: false,
      shift: false,
      control: false,
      touches: touches
    });
  });
}
function makeKeyDownHandler(canvas) {
  var timeout = 0;
  window.addEventListener('keydown', function (e) {
    timeout = setTimeout(function () {
      fireEvent('keyDown', {
        str: '',
        keyCode: e.keyCode,
        option: e.altKey,
        shift: e.shiftKey,
        control: e.ctrlKey
      }, 1);
    });
  });
  window.addEventListener('keypress', function (e) {
    if (timeout) {
      clearTimeout(timeout);
      timeout = 0;
    }
    fireEvent('keyDown', {
      str: String.fromCharCode(e.charCode),
      keyCode: e.keyCode,
      option: e.altKey,
      shift: e.shiftKey,
      control: e.ctrlKey
    });
  });
}
function simpleWindow(obj) {
  var canvas = obj.settings.canvas;
  if (obj.settings.fullscreen) {
    obj.settings.width = window.innerWidth;
    obj.settings.height = window.innerHeight;
  }
  if (!canvas) {
    canvas = document.getElementById('canvas');
  } else if (obj.settings.width && obj.settings.height) {
    canvas.width = obj.settings.width;
    canvas.height = obj.settings.height;
  } else {
    obj.settings.width = canvas.width;
    obj.settings.height = canvas.height;
  }
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.width = obj.settings.width;
    canvas.height = obj.settings.height;
  }
  if (window.devicePixelRatio == 2) {
    canvas.width = obj.settings.width * 2;
    canvas.height = obj.settings.height * 2;
    canvas.style.width = obj.settings.width + 'px';
    canvas.style.height = obj.settings.height + 'px';
    canvas.msaaEnabled = true;
    canvas.msaaSamples = 2;
    obj.settings.width *= 2;
    obj.settings.height *= 2;
  }
  obj.width = obj.settings.width;
  obj.height = obj.settings.height;
  obj.canvas = canvas;
  canvas.style.backgroundColor = '#000000';
  function go() {
    if (obj.stencil === undefined)
      obj.stencil = false;
    if (obj.settings.fullscreen) {
      document.body.style.margin = '0';
      document.body.style.padding = '0';
      document.body.style.overflow = 'hidden';
    }
    var gl = null;
    var ctx = null;
    if (obj.settings.type == '3d') {
      try {
        gl = canvas.getContext('experimental-webgl', { antialias: true });  //, {antialias: true, premultipliedAlpha : true, stencil: obj.settings.stencil}
      } catch (err) {
        console.error(err.message);
        return;
      }
      if (gl === null) {
        throw 'No WebGL context is available.';
      }
    } else if (obj.settings.type == '2d') {
      ctx = canvas.getContext('2d');
    }
    obj.framerate = function (fps) {
      requestAnimFrameFps = fps;
    };
    obj.on = function (eventType, handler) {
      eventListeners.push({
        eventType: eventType,
        handler: handler
      });
    };
    registerEvents(canvas);
    obj.dispose = function () {
      obj.__disposed = true;
    };
    obj.gl = gl;
    obj.ctx = ctx;
    obj.init();
    function drawloop() {
      if (!obj.__disposed) {
        obj.draw();
        requestAnimFrame(drawloop);
      }
    }
    requestAnimFrame(drawloop);
  }
  if (!canvas.parentNode) {
    if (document.body) {
      document.body.appendChild(canvas);
      go();
    } else {
      window.addEventListener('load', function () {
        document.body.appendChild(canvas);
        go();
      }, false);
    }
  } else {
    go();
  }
  return obj;
}

var BrowserWindow = { simpleWindow: simpleWindow };

module.exports = BrowserWindow;
},{"./Platform":43}],42:[function(require,module,exports){
(function (process){
var Platform = require('./Platform');
var plask = require('plask');
var path = require('path');
var fs = require('fs');

var PlaskIO = function() {
  function IO() {
  }

  IO.loadTextFile = function (file, callback) {
    var fullPath = path.resolve(IO.getWorkingDirectory(), file);
    if (!fs.existsSync(fullPath)) {
      if (callback) {
        return callback(null);
      }
    }
    var data = fs.readFileSync(fullPath, 'utf8');
    if (callback) {
      callback(data);
    }
  };

  IO.getWorkingDirectory = function () {
    return process.cwd();
  };

  IO.loadImageData = function (gl, texture, target, file, flip, callback) {
    var fullPath = path.resolve(IO.getWorkingDirectory(), file);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(texture.target, texture.handle);
    var canvas = plask.SkCanvas.createFromImage(fullPath);
    if (flip) {
      gl.texImage2DSkCanvas(target, 0, canvas);
    }
    else {
      gl.texImage2DSkCanvasNoFlip(target, 0, canvas);
    }
    if (callback) {
      callback(canvas);
    }
  };

  IO.watchTextFile = function (file, callback) {
    fs.watch(file, {}, function (event, fileName) {
      if (event == 'change') {
        var data = Node.fs.readFileSync(file, 'utf8');
        if (callback) {
          callback(data);
        }
      }
    });
  };

  IO.saveTextFile = function (file, data) {
    Node.fs.writeFileSync(file, data);
  };
  return IO;
};

var WebIO = function () {
  function IO() {
  }

  IO.getWorkingDirectory = function () {
    return '';
  };

  IO.loadTextFile = function (url, callback) {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.onreadystatechange = function (e) {
      if (request.readyState == 4) {
        if (request.status == 200) {
          if (callback) {
            callback(request.responseText);
          }
        } else {
          Log.error('WebIO.loadTextFile error : ' + request.statusText);
        }
      }
    };
    request.send(null);
  };

  IO.loadImageData = function (gl, texture, target, url, flip, callback) {
    var image = new Image();
    image.onload = function () {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(texture.target, texture.handle);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, flip);
      gl.texImage2D(target, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      if (callback) {
        callback(image);
      }
    };
    image.src = url;
  };

  IO.watchTextFile = function () {
    console.log('Warning: WebIO.watch is not implemented!');
  };

  IO.saveTextFile = function (url, data, callback) {
    var request = new XMLHttpRequest();
    request.open('POST', url, true);
    request.onreadystatechange = function (e) {
      if (request.readyState == 4) {
        if (request.status == 200) {
          if (callback) {
            callback(request.responseText, request);
          }
        } else {
          Log.error('WebIO.saveTextFile error : ' + request.statusText);
        }
      }
    };
    request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    request.send('data=' + encodeURIComponent(data));
  };

  return IO;
};

if (Platform.isPlask) module.exports = PlaskIO();
else if (Platform.isBrowser) module.exports = WebIO();
}).call(this,require("/Users/vorg/Workspace/vorg-pex/experiments/v3/pex-exp-modules/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js"))
},{"./Platform":43,"/Users/vorg/Workspace/vorg-pex/experiments/v3/pex-exp-modules/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js":3,"fs":2,"path":4,"plask":2}],43:[function(require,module,exports){
(function (process){
module.exports.isPlask = typeof window === 'undefined' && typeof process === 'object';
module.exports.isBrowser = typeof window === 'object' && typeof document === 'object';
module.exports.isEjecta = typeof ejecta === 'object' && typeof ejecta.include === 'function';

}).call(this,require("/Users/vorg/Workspace/vorg-pex/experiments/v3/pex-exp-modules/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js"))
},{"/Users/vorg/Workspace/vorg-pex/experiments/v3/pex-exp-modules/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js":3}],44:[function(require,module,exports){
var Time = {
    now: 0,
    prev: 0,
    delta: 0,
    seconds: 0,
    frameNumber: 0,
    fpsFrames: 0,
    fpsTime: 0,
    fps: 0,
    fpsFrequency: 3,
    paused: false,
    verbose: false
};

Time.update = function(delta) {
  if (Time.paused) {
    return;
  }

  if (Time.prev === 0) {
    Time.prev = Date.now();
  }

  Time.now = Date.now();
  Time.delta = (delta !== undefined) ? delta : (Time.now - Time.prev) / 1000;

  //More than 1s = probably switched back from another window so we have big jump now
  if (Time.delta > 1) {
    Time.delta = 0;
  }

  Time.prev = Time.now;
  Time.seconds += Time.delta;
  Time.fpsTime += Time.delta;
  Time.frameNumber++;
  Time.fpsFrames++;

  if (Time.fpsTime > Time.fpsFrequency) {
    Time.fps = Time.fpsFrames / Time.fpsTime;
    Time.fpsTime = 0;
    Time.fpsFrames = 0;
    if (this.verbose)
      Log.message('FPS: ' + Time.fps);
  }
  return Time.seconds;

};

var startOfMeasuredTime = 0;

Time.startMeasuringTime = function() {
  startOfMeasuredTime = Date.now();
};

Time.stopMeasuringTime = function(msg) {
  var now = Date.now();
  var seconds = (now - startOfMeasuredTime) / 1000;
  if (msg) {
    console.log(msg + seconds);
  }
  return seconds;
};

Time.pause = function() {
  Time.paused = true;
};

Time.togglePause = function() {
  Time.paused = !Time.paused;
};

module.exports = Time;
},{}],45:[function(require,module,exports){
var Platform = require('./Platform');
var BrowserWindow = require('./BrowserWindow');
var Time = require('./Time');
var merge = require('merge');
var plask = require('plask');

var DefaultSettings = {
  'width': 1280,
  'height': 720,
  'type': '3d',
  'vsync': true,
  'multisample': true,
  'fullscreen': false,
  'center': true,
  'hdpi': 1
};

var Window = {
  currentWindow: null,
  create: function(obj) {
    console.log('Window+');
    console.log('Platform', 'plask:' + Platform.isPlask, 'browser:' + Platform.isBrowser, 'ejecta:' + Platform.isEjecta);

    obj.settings = obj.settings || {};
    obj.settings = merge(DefaultSettings, obj.settings);

    obj.__init = obj.init;
    obj.init = function() {
      Window.currentWindow = this;
      obj.framerate(60);
      if (obj.__init) {
        obj.__init();
      }
    }

    obj.__draw = obj.draw;
    obj.draw = function() {
      Window.currentWindow = this;
      //FIXME: this will cause Time update n times, where n is number of Window instances opened
      Time.update();
      if (obj.__draw) {
        obj.__draw();
      }
    }

    if (Platform.isPlask) {
      plask.simpleWindow(obj);
    }
    else if (Platform.isBrowser || Platform.isEjecta) {
      BrowserWindow.simpleWindow(obj);
    }
  }
};

module.exports = Window;
},{"./BrowserWindow":41,"./Platform":43,"./Time":44,"merge":46,"plask":2}],46:[function(require,module,exports){
module.exports=require(39)
},{}]},{},[1])