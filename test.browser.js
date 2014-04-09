(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports.Platform = require('./lib/Platform');
module.exports.Window = require('./lib/Window');
module.exports.Node = require('./lib/Node');
},{"./lib/Node":3,"./lib/Platform":4,"./lib/Window":5}],2:[function(require,module,exports){
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
  if (Platform.isEjecta && window.devicePixelRatio == 2) {
    canvas.width = obj.settings.width * 2;
    canvas.height = obj.settings.height * 2;
    canvas.style.width = obj.settings.width;
    canvas.style.height = obj.settings.height;
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
},{"./Platform":4}],3:[function(require,module,exports){
var Platform = require('./Platform');

module.exports.plask = Platform.isPlask ? require('plask') : {};
module.exports.fs = Platform.isPlask ? require('fs') : {};
module.exports.path = Platform.isPlask ? require('path') : {};
},{"./Platform":4,"fs":8,"path":10,"plask":8}],4:[function(require,module,exports){
(function (process){
module.exports.isPlask = typeof window === 'undefined' && typeof process === 'object';
module.exports.isBrowser = typeof window === 'object' && typeof document === 'object';
module.exports.isEjecta = typeof ejecta === 'object' && typeof ejecta.include === 'function';

}).call(this,require("/usr/local/lib/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js"))
},{"/usr/local/lib/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js":9}],5:[function(require,module,exports){
var Platform = require('./Platform');
var BrowserWindow = require('./BrowserWindow');
var Node = require('./Node');
var merge = require('merge');

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
  create: function(obj) {
    console.log('Window+');
    console.log('Platform', 'plask:' + Platform.isPlask, 'browser:' + Platform.isBrowser, 'ejecta:' + Platform.isEjecta);

    obj.settings = obj.settings || {};
    obj.settings = merge(DefaultSettings, obj.settings);

    if (Platform.isPlask) {
      Node.plask.simpleWindow(obj);
    }
    else if (Platform.isBrowser || Platform.isEjecta) {
      BrowserWindow.simpleWindow(obj);
    }
  }
};

module.exports = Window;
},{"./BrowserWindow":2,"./Node":3,"./Platform":4,"merge":6}],6:[function(require,module,exports){
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
},{}],7:[function(require,module,exports){
var sys = require('pex-sys');

console.log('test');

sys.Window.create({
  settings: {
    width: 1280,
    height: 720,
    type: '3d'
  },
  init: function() {

  },
  draw: function() {
    this.gl.clearColor(1, 0, 0, 1);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
  }
});
},{"pex-sys":1}],8:[function(require,module,exports){

},{}],9:[function(require,module,exports){
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

},{}],10:[function(require,module,exports){
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

}).call(this,require("/usr/local/lib/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js"))
},{"/usr/local/lib/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js":9}]},{},[7])