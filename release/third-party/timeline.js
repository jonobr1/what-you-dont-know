//========= Copyright 2017, Within Unlimited, Inc. All rights reserved. ===========
(function() {

  var timeline = Within.timeline = {

    scope: null,

    buffering: false,

    playing: false,

    lastBuffered: 0,

    bufferOffset: 50,

    bufferInterval: 0,

    bufferCount: 0,

    set: function(scope) {
      timeline.scope = scope;
    },

    toggle: function() {

      var scope = timeline.scope;
      var video = scope.video || scope.player;

      if (video.paused) {
        scope.play();
      } else {
        scope.pause();
      }

    },

    toggleVR: function(e) {

      e.preventDefault();

      var scope = timeline.scope;
      var renderer = scope.renderer;

      var display = renderer.effect.getVRDisplay();

      if ( display ) {

        var canvas = renderer.domElement;
        display.isPresenting ? display.exitPresent() : display.requestPresent( [ { source: canvas } ] );

        scope.play();

      } else {

        var alreadyOpen = e.target.classList.contains('open');

        e.target.classList.toggle('open');

        function closeInfo() {
          e.target.classList.remove('open');
          window.removeEventListener('click', closeInfo, false);
        }

        if (!alreadyOpen) {
          setTimeout(function() {
            window.addEventListener('click', closeInfo, false);
          }, 0);
        }

      }

    },

    fullscreen: function() {

      screenfull.toggle(document.body);
      if (window.ga) {
        ga('send', 'event', 'video', 'fullscreen', Within.current.str_id,
          screenfull.isFullscreen ? 1 : 0, {'dimension4': Within.current.title});
      }

    },

    mousedown: function(e) {

      e.preventDefault();

      var scope = timeline.scope;
      var navigation = scope.navigation;
      var video = scope.video || scope.player;
      var hideNavigation = scope.hideNavigation;

      var rect = navigation.timeline.getBoundingClientRect();
      var xpct = (e.clientX - rect.left) / rect.width;
      scope.seek(xpct);
      timeline.playing = !video.paused;
      if (timeline.playing) {
        scope.pause(true);
      }
      hideNavigation.dragging = true;

      window.addEventListener('mousemove', timeline.mousemove, false);
      window.addEventListener('touchmove', timeline.touchmove, false);
      window.addEventListener('mouseup', timeline.mouseup, false);
      window.addEventListener('touchend', timeline.mouseup, false);
      window.addEventListener('touchcancel', timeline.mouseup, false);

      return false;

    },

    touchmove: function(e) {

      // e.preventDefault();
      var touch = e.touches[0];

      timeline.mousemove({
        preventDefault: _.identity,
        clientX: touch.pageX,
        clientY: touch.pageY
      });

      return false;

    },

    mousemove: function(e) {

      e.preventDefault();

      var scope = timeline.scope;
      var navigation = scope.navigation;

      var rect = navigation.timeline.getBoundingClientRect();
      var xpct = (e.clientX - rect.left) / rect.width;
      scope.seek(xpct);

      return false;

    },

    mouseup: function(e) {

      e.preventDefault();

      var scope = timeline.scope;
      if (timeline.playing) {
        var play = function() {
          scope.play(true);
        };
        _.delay(play, 10);
      }

      scope.hideNavigation.dragging = false;

      window.removeEventListener('mousemove', timeline.mousemove, false);
      window.removeEventListener('touchmove', timeline.touchmove, false);
      window.removeEventListener('mouseup', timeline.mouseup, false);
      window.removeEventListener('touchend', timeline.mouseup, false);
      window.removeEventListener('touchcancel', timeline.mouseup, false);

      return false;

    }

  };

})();
