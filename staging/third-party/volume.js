//========= Copyright 2017, Within Unlimited, Inc. All rights reserved. ===========
(function() {

  var volume = Within.volume = {

    scope: null,

    set: function(scope) {
      volume.scope = scope;
    },

    previous: 1, // save previous volume level for unmuting

    update: function() {

      var scope = volume.scope;
      var navigation = scope.navigation;
      var controller = scope.mediacontroller;

      navigation.volume.level.style.height = 100 * controller.volume + '%';

      var action = controller.volume > 0 ? 'remove' : 'add';
      navigation.volume.classList[action]('mute');

      var halfAction = (controller.volume < 0.5 && controller.volume > 0) ? 'add' : 'remove';
      navigation.volume.classList[halfAction]('volume-half');
    },

    mute: function() {

      var scope = volume.scope;
      var controller = scope.mediacontroller;

      controller.volume = 0;
      volume.update();
      volume.track();
    },

    unmute: function() {

      var scope = volume.scope;
      var controller = scope.mediacontroller;

      controller.volume = volume.previous;
      volume.update();
      volume.track();
    },

    toggle: function() {

      var scope = volume.scope;
      var controller = scope.mediacontroller;

      controller.volume = controller.volume > 0 ? 0 : volume.previous;
      volume.update();
      volume.track();
    },

    sliderClick: function(e) {
      e.preventDefault();
      e.stopPropagation(); // prevent mute toggle
    },

    slide: function(e) {


      var scope = volume.scope;
      var navigation = scope.navigation;
      var controller = scope.mediacontroller;

      var rect = navigation.volume.stage.getBoundingClientRect();
      var ypct = (rect.bottom - e.clientY) / rect.height;
      ypct = Math.max(0, Math.min(1, ypct));

      controller.volume = ypct;
      volume.update();
    },

    mousedown: function(e) {

      e.preventDefault();

      var scope = volume.scope;
      var navigation = scope.navigation;

      // prevent slider from disappearing when mousedown mouse is outside of slider
      navigation.volume.classList.add('active');
      volume.slide(e);

      window.addEventListener('mousemove', volume.mousemove, false);
      window.addEventListener('touchmove', volume.touchmove, false);
      window.addEventListener('mouseup', volume.mouseup, false);
      window.addEventListener('touchend', volume.mouseup, false);
      window.addEventListener('touchcancel', volume.mouseup, false);
    },

    mousemove: function(e) {
      e.preventDefault();
      volume.slide(e);
    },

    touchstart: function(e) {
      e.preventDefault();
      var touch = e.touches[0];
      volume.mousedown({
        preventDefault: function() {},
        clientX: touch.pageX,
        clientY: touch.pageY
      });
      return false;
    },

    touchmove: function(e) {
      e.preventDefault();
      var touch = e.touches[0];
      volume.mousemove({
        preventDefault: function() {},
        clientX: touch.pageX,
        clientY: touch.pageY
      });
      return false;
    },

    mouseup: function(e) {

      e.preventDefault();

      var scope = volume.scope;
      var navigation = scope.navigation;
      var controller = scope.mediacontroller;

      navigation.volume.classList.remove('active');
      volume.previous = controller.volume;
      volume.track();

      window.removeEventListener('mousemove', volume.mousemove, false);
      window.removeEventListener('touchmove', volume.touchmove, false);
      window.removeEventListener('mouseup', volume.mouseup, false);
      window.removeEventListener('touchend', volume.mouseup, false);
      window.removeEventListener('touchcancel', volume.mouseup, false);
    },

    mouseover: function() {
      var scope = volume.scope;
      var navigation = scope.navigation;
      navigation.volume.classList.add('hover');
    },

    mouseout: function() {
      var scope = volume.scope;
      var navigation = scope.navigation;
      navigation.volume.classList.remove('hover');
    },

    track: function() {

      var scope = volume.scope;
      var controller = scope.mediacontroller;

      if (has.localStorage) {
        window.localStorage.setItem('volume', controller.volume);
      }

      // http://stackoverflow.com/questions/11832914/round-to-at-most-2-decimal-places-in-javascript
      var volumeRounded = Math.round((controller.volume + 0.00001) * 1000) / 1000;

      if (window.ga) {
        ga('send', 'event', 'video', 'volume', Within.id, volumeRounded);
      }
    }

  };

})();
