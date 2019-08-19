//========= Copyright 2017, Within Unlimited, Inc. All rights reserved. ===========
(function() {

  var TWO_PI = Math.PI * 2;
  var identity = function() {};

  var root = this;
  var Within = root.Within || {};

  root.Within = Within;

  var Loader = Within.Loader = function(s) {
    var size = this.size = s || 100;
    this.domElement = document.createElement('canvas');
    this.domElement.classList.add('within-loader');
    this.ctx = this.domElement.getContext('2d');
    this.domElement.width = this.domElement.height = size * 2;
    this.domElement.style.width = this.domElement.style.height = size + 'px';
  };

  Loader.prototype = {
    constructor: Loader,
    needsUpdate: false,
    size: 100,
    _bp: 0,
    _ep: 0,
    drag: 0.08175,
    precision: 0.001,
    startTime: 0,
    duration: 1000,
    automated: false,
    taper: false,
    req: null,
    appendTo: function(elem) {
      elem.appendChild(this.domElement);
      return this;
    },
    update: function() {
      if (this.automated) {

        var now = Date.now();
        var delta = now - this.startTime;
        var a = 0.6;
        var b = 1 - a;

        this._ep = this.easing(
          Math.max(Math.min(delta / this.duration, 1), 0));
        this._bp = this.easing(
          Math.max(Math.min((delta - this.duration * a) / (this.duration * b), 1), 0));

        if (delta > this.duration) {
          this._ep = 0;
          this._bp = 0;
          this.startTime = now;
        }

        this.needsUpdate = true;
      }

      if (!this.needsUpdate) {
        return this;
      }

      var ctx = this.ctx;
      var d = this.domElement.width;
      var c = d / 2;
      var o = - Math.PI / 2;

      ctx.clearRect(0, 0, d, d);

      ctx.beginPath();
      ctx.arc(c, c, c - this.ctx.lineWidth / 2,
        this._bp * TWO_PI + o, this._ep * TWO_PI + o, false);
      ctx.stroke();

      this.needsUpdate = false;

      return this;
    },
    play: function() {
      var scope = this;
      this.startTime = Date.now();
      this.playing = true;

      this.loop = function() {
        requestAnimationFrame(scope.loop);
        scope.update();
      };

      this.loop();

      return this;
    },
    // loop: function() {
    //   this.req = requestAnimationFrame(this.loop);
    //   this.update();
    // },
    pause: function() {
      // shouldnt we just use cancelAnimationFrame?
      // cancelAnimationFrame(this.req);
      this.loop = identity;
      this.playing = false;
      return this;
    },
    easing: function(k) {
      return 0.5 * ( 1 - Math.cos( Math.PI * k ) );
    }
  };

  Object.defineProperty(Loader.prototype, 'bp', {
    get: function() {
      return this._bp;
    },
    set: function(v) {
      if (v === this._bp) {
        return;
      }
      this._bp = v;
      this.needsUpdate = true;
    }
  });

  Object.defineProperty(Loader.prototype, 'ep', {
    get: function() {
      return this._ep;
    },
    set: function(v) {
      if (v === this._ep) {
        return;
      }
      this._ep = v;
      this.needsUpdate = true;
    }
  });

  // This should just be set on the loader object and constructor?
  Object.defineProperty(Loader.prototype, 'linewidth', {
    get: function() {
      return this.ctx.lineWidth;
    },
    set: function(v) {
      this.ctx.lineWidth = v;
    }
  });

  // This should just be set on the loader object and constructor?
  Object.defineProperty(Loader.prototype, 'stroke', {
    get: function() {
      return this.ctx.strokeStyle;
    },
    set: function(s) {
      this.ctx.strokeStyle = s;
    }
  });

})();
