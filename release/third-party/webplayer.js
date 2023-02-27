(function() {

  var masthead, navigation, showNavigation, hideNavigation, initialLoad;
  var width = window.innerWidth;
  var height = window.innerHeight;

  var controller = {

    _volume: 1,

    //

    get volume() {
      return controller._volume;
    },
    set volume(v) {

      controller._volume = v;
      var manager = resources.get('audio-manager');

      if (!manager) {
        return;
      }

      manager.master.gain.value = controller._volume;

      var presets = resources.get('presets');
      var button = presets.userData.mute;
      var slash = button.userData.slash;

      slash.visible = manager.master.gain.value === 0;

    }

  };

  var resources = window.resources = new FRAME.Resources();

  var container = domElement = document.createElement('div');
  container.style.opacity = 0;
  container.style.width = '100%';
  container.style.height = '100%';
  document.body.appendChild(container);

  resources.set( 'dom', container );

  var timeline = window.timeline = new FRAME.Timeline();
  var player = window.player = new FRAME.Player();

  createUI();

  timeline.load( './experience.json', setup );

  function setup() {

    window.addEventListener('resize', resize, false);

    if (!url.boolean('internal', false)) {
      domElement.appendChild(masthead);
    }
    domElement.appendChild(navigation.domElement);
    domElement.appendChild(masthead.embed);

    timeline.compile( resources, player );
    resources.onLoad( function () {

      var renderer = resources.get('renderer');

      // window.addEventListener('keyup', this._toggle, false);
      // window.addEventListener('vrdisplaypresentchange', this._vrdisplaypresentchange, false);

      renderer.domElement.addEventListener('mousedown', mousedown, false);
      renderer.domElement.addEventListener('mouseup', mouseup, false);

      masthead.querySelector('a').addEventListener('click', pause, false);
      masthead.addEventListener('mousemove', showNavigation.cease, false);
      navigation.domElement.addEventListener('mousemove', showNavigation.cease, false);
      masthead.addEventListener('touchstart', showNavigation.cease, false);
      navigation.domElement.addEventListener('touchstart', showNavigation.cease, false);

      window.addEventListener('touchstart', touchstart, false);
      window.addEventListener('mousemove', mousemove, false);
      navigation.timeline.addEventListener('mouseover', mouseover, false);
      navigation.timeline.addEventListener('mouseout', mouseout, false);

      if (navigation.ui.volume) {
        var presets = resources.get('presets');
        var mute = presets.userData.mute;
        mute.addEventListener('mute', updateVolume);
      }

      if (navigation.fullscreen) {
        navigation.fullscreen.addEventListener('click', navigation.ui.timeline.fullscreen, false);
        document.addEventListener(screenfull.raw.fullscreenchange, toggleFullscreen, false);
      }

      document.body.classList.add('loaded');
      initialLoad.pause();
      if (initialLoad.domElement.parentNode) {
        initialLoad.domElement.parentNode.removeChild(initialLoad.domElement);
      }

      container.style.opacity = 1;
      resources.get( 'renderer' ).setAnimationLoop( render );

    } );

  }

  function createUI() {

    initialLoad = this.initialLoad = new Within.Loader(100)
      .appendTo(document.body);

    initialLoad.stroke = 'white';
    initialLoad.linewidth = 3;
    initialLoad.automated = true;

    initialLoad.domElement.style.marginLeft = - initialLoad.size / 2 + 'px';
    initialLoad.domElement.style.marginTop = - initialLoad.size / 2 + 'px';
    initialLoad.domElement.style.zIndex = -1;
    initialLoad.play();

    masthead = document.createElement('div');
    masthead.classList.add('masthead');
    masthead.innerHTML = '<a class="logo" href="http://with.in" target="_blank">&nbsp;</a>';

    masthead.back = document.createElement('a');
    masthead.back.target = '_blank';
    masthead.back.href = 'http://with.in/';
    masthead.back.classList.add('back');
    masthead.appendChild(masthead.back);

    masthead.share = document.createElement('div');
    masthead.share.classList.add('share');
    masthead.appendChild(masthead.share);

    masthead.share.menu = document.createElement('ul');
    masthead.share.menu.classList.add('menu');
    masthead.share.trackEvent = function(e) {
      if (timeline.playing) {
        pause();
      }
      e.stopPropagation();
    };
    masthead.share.appendChild(masthead.share.menu);

    window.addEventListener('message', function(e) {
      var data = e.data;
      switch (data.type) {
        case 'embed':
          showEmbed();
          break;
        default:
          console.log(data);
      }
    }, false);

    var platforms = ['embed', 'twitter', 'facebook'];

    for (var i = 0; i < platforms.length; i++) {

      var name = platforms[i];
      var li = document.createElement('li');
      li.classList.add(name);

      var a = document.createElement('a');
      a.setAttribute('platform', name);
      a.target = '_blank';
      li.appendChild(a);

      var url = 'https://within-unlimited.github.io/what-you-dont-know/';
      var text = encodeURIComponent('Check out “What You Don’t Know” — a #VR Experience on @WITHIN:');

      switch (name) {

        case 'embed':
          if (has.mobile) {
            li.classList.add('hidden');
          }
          a.target = '';
          a.addEventListener('click', function() {
            showEmbed();
          }, false);
          break;
        case 'facebook':
          a.href = 'http://www.facebook.com/sharer.php?u=' + url;
          break;
        case 'twitter':
          a.href = 'https://twitter.com/share?text=' + text + '&url=' + url;
          break;

      }

      a.addEventListener('click', masthead.share.trackEvent, false);
      masthead.share.menu.appendChild(li);

    }

    masthead.embed = document.createElement('div');
    masthead.embed.id = 'embed';
    masthead.embed.innerHTML = [
      '<div class="background"></div>',
      '<div class="foreground">',
        '<p>Embed this film on your site:</p>',
        '<input width="250">',
      '</div>'
    ].join('');
    masthead.embed.background = masthead.embed.querySelector('.background');
    masthead.embed.input = masthead.embed.querySelector('input');

    masthead.embed.input.value = [
      '<iframe width="540" height="270" src="',
      window.location.href,
      '" frameborder="0" allow="vr" allowfullscreen allowvr></iframe>'
    ].join('');

    masthead.embed.background.addEventListener('mouseup', hideEmbed, false);
    masthead.embed.background.addEventListener('touchend', hideEmbed, false);
    masthead.embed.background.addEventListener('touchcancel', hideEmbed, false);

    navigation = {
      domElement: document.createElement('div'),
      // badge: document.createElement('div'),
      play: document.createElement('div'),
      volume: document.createElement('div'),
      time: document.createElement('div'),
      timeline: document.createElement('div'),
      stage: document.createElement('div'),
      buffered: document.createElement('div'),
      selection: document.createElement('div'),
      played: document.createElement('div'),
      cursor: document.createElement('div'),
      duration: document.createElement('div'),
      immerse: document.createElement('div')
    };

    hideNavigation = debounce(function() {
      var threshold = showNavigation.threshold;
      // Delay hiding if the mouse is overlaid.
      if (showNavigation.persistent
        || hideNavigation.dragging
        || hideNavigation.mouse.y > height - threshold
        || hideNavigation.mouse.y < threshold
        || navigation.volume.classList.contains('hover')
        || navigation.volume.classList.contains('active')
        || masthead.share.classList.contains('enabled')) {
        hideNavigation();
        return;
      }
      hideNavigation.immediately();
    }, 1000);
    hideNavigation.immediately = function() {
      document.body.classList.remove('navigating');
      navigation.volume.classList.remove('hover');
    };
    hideNavigation.mouse = { x: width / 2, y: height / 2 }
    hideNavigation.dragging = false; // TODO

    showNavigation = function(e) {
      var threshold = showNavigation.threshold;

      hideNavigation.mouse.x = e.clientX;
      hideNavigation.mouse.y = e.clientY;

      if (!e.forced && !showNavigation.persistent) {

        if (!navigation.volume.classList.contains('hover')
          && !navigation.volume.classList.contains('active')
          && !masthead.share.classList.contains('enabled')) {

          if (document.body.classList.contains('grabbing')
            || (e.clientY < height - threshold && e.clientY > threshold)) {
            document.body.classList.remove('navigating');
            return;
          }

        }

      }

      document.body.classList.add('navigating');
      hideNavigation();

    };
    showNavigation.cease = function() {
      showNavigation.persistent = false;
    };
    showNavigation.threshold = 100;
    showNavigation.persistent = false;

    if (window.screenfull && window.screenfull.enabled) {
      navigation.fullscreen = document.createElement('div');
      navigation.fullscreen.classList.add('right');
    }

    navigation.volume.sliderOutside = document.createElement('div');
    navigation.volume.sliderOutside.classList.add('sliderOutside');
    navigation.volume.appendChild(navigation.volume.sliderOutside);

    navigation.volume.slider = document.createElement('div');
    navigation.volume.slider.classList.add('slider');
    navigation.volume.sliderOutside.appendChild(navigation.volume.slider);

    navigation.volume.slider.inner = document.createElement('div');
    navigation.volume.slider.inner.classList.add('inner');
    navigation.volume.slider.appendChild(navigation.volume.slider.inner);

    navigation.volume.stage = document.createElement('div');
    navigation.volume.stage.classList.add('stage');
    navigation.volume.slider.inner.appendChild(navigation.volume.stage);

    navigation.volume.level = document.createElement('div');
    navigation.volume.level.classList.add('level');
    navigation.volume.stage.appendChild(navigation.volume.level);

    var elements = ['domElement', /*'timeline',*/ 'play', 'volume', 'time',
      'stage', 'buffered', 'selection', 'played', 'cursor', 'duration',
      'immerse', 'fullscreen'];

    for (var i = 0; i < elements.length; i++) {

      var name = elements[i];

      if (/domElement/i.test(name)) {
        navigation.domElement.classList.add('navigation');
        continue;
      }

      var elem = navigation[name];

      if (!elem) {
        continue;
      }

      elem.classList.add(name);
      navigation.domElement.appendChild(elem);

    }

    navigation.time.innerHTML = '0:00';
    navigation.duration.innerHTML = '0:00';

    navigation.selection.mouse = { x: width / 2, y: height / 2 };

    // navigation.badge.classList.add('webvr-badge');

    // navigation.domElement.appendChild(navigation.badge);
    navigation.timeline.appendChild(navigation.stage);
    navigation.stage.appendChild(navigation.buffered);
    navigation.stage.appendChild(navigation.selection);
    navigation.stage.appendChild(navigation.played);
    navigation.timeline.appendChild(navigation.cursor);

    navigation.ui = {};

    var timeline = navigation.ui.timeline = Within.timeline;
    if (timeline) {

      timeline.set({ navigation: navigation, mediacontroller: controller });
      // TODO: On disable make sure timeline has the old toggles
      timeline.toggle = function() {
        if (player.isPlaying) {
          pause();
        } else {
          play();
        }
      }

      navigation.play.addEventListener('click', timeline.toggle, false);

      navigation.timeline.addEventListener('mousedown', timeline.mousedown, false);
      navigation.timeline.addEventListener('touchstart', function(e) {
        var touch = e.touches[0];
        e.preventDefault();
        timeline.mousedown({
          preventDefault: function() {},
          clientX: touch.pageX,
          clientY: touch.pageY
        });
        return false;
      }, false);

    }

    var volume = navigation.ui.volume = Within.volume;
    if (volume) {

      volume.set({ navigation: navigation, mediacontroller: controller });
      navigation.volume.addEventListener('click', volume.toggle, false);
      navigation.volume.addEventListener('mouseover', volume.mouseover, false);
      navigation.volume.addEventListener('mouseout', volume.mouseout, false);
      navigation.volume.slider.addEventListener('touchstart', volume.touchstart, false);
      navigation.volume.slider.addEventListener('click', volume.sliderClick, false);
      navigation.volume.slider.addEventListener('mousedown', volume.mousedown, false);

      // Update the manager gain value based on controller.volume
      // Listen to when the mute preset is triggered

    }

    // https://developer.apple.com/library/safari/documentation/AudioVideo/Conceptual/Using_HTML5_Audio_Video/Device-SpecificConsiderations/Device-SpecificConsiderations.html
    var disableVolume = has.iOS;

    if (disableVolume) {

      navigation.volume.style.display = 'none';

    } else if (has.localStorage) {

      var v = window.localStorage.getItem('volume');
      if (v === undefined || v === null) {
        v = 1;
      }

      controller.volume = v;
      if (volume) {
        volume.update();
      }

    }

  }

  function play() {

    document.body.classList.add('playing');
    hideNavigation();

    var titleScreen = resources.get('title-screen');
    var playButton = titleScreen.userData.play;
    var label = playButton.userData.label;

    label.material.uniforms.image.value = label.userData.textures.pause;
    player.play();

  }

  function pause() {

    document.body.classList.remove('playing');

    var titleScreen = resources.get('title-screen');
    var playButton = titleScreen.userData.play;
    var label = playButton.userData.label;

    label.material.uniforms.image.value = label.userData.textures.play;
    player.pause();

  }

  function toggle() {

    if (player.isPlaying) {
      pause();
    } else {
      play();
    }

  }

  function resize() {

    width = window.innerWidth;
    height = window.innerHeight;

  }

  function getDuration() {

    var manager = resources.get('audio-manager');
    return (manager && manager.duration) || 0;

  }

  function updateUI(ct) {

    var duration = getDuration();
    var currentTime = ct || player.currentTime || 0;
    var pct = Math.min(Math.max(currentTime / duration, 0), 1);

    navigation.cursor.style.left = navigation.played.style.width = 100 * pct + '%';
    navigation.time.style.display = 'inline-block';
    navigation.time.innerHTML = formatDuration(currentTime);
    navigation.duration.innerHTML = formatDuration(duration);

    var registeredAsPlaying = document.body.classList.contains('playing');

    if (player.isPlaying && !registeredAsPlaying) {
      document.body.classList.add('playing');
    } else if (!player.isPlaying && registeredAsPlaying) {
      document.body.classList.remove('playing');
    }

    navigation.time.currentTime = currentTime;

  }

  function updateVolume(e) {

    var volume = navigation.ui.volume;

    if (e.muted) {
      volume.mute();
    } else {
      volume.unmute();
    }

  }

  var prevTime = null;

  function render(time) {

    if ( prevTime === null ) {
      prevTime = time;
    }

    if (player.currentTime !== navigation.time.currentTime) {
      updateUI(player.currentTime);
    }

    player.tick( time - prevTime );
    timeline.update( player.currentTime );
    prevTime = time;

  }

  function touchstart(e) {
    var touch = e.touches[0];
    showNavigation({
      preventDefault: function() {},
      clientX: touch.pageX,
      clientY: touch.pageY
    });
  }

  function mousedown() {
    // console.log('mousedown');
  }

  function mousemove(e) {
    showNavigation(e);
    navigation.selection.mouse.x = e.clientX;
    navigation.selection.mouse.y = e.clientY;
  }

  function mouseup() {
    // console.log('mouseup');
  }

  function mouseover() {
    navigation.selection.enabled = true;
    document.body.classList.add('selecting');
  }

  function mouseout() {
    hideNavigation();
    navigation.selection.enabled = false;
    document.body.classList.remove('selecting');
  }

  function toggleFullscreen() {
    var action = screenfull.isFullscreen ? 'add' : 'remove';
    document.body.classList[action]('fullscreen');
  }

  function hideEmbed() {

    document.body.classList.remove('embedding');

    if (masthead.embed.playing) {
      play();
    }

    return false;

  }

  function showEmbed() {

    masthead.embed.playing = this.timeline.playing;
    document.body.classList.add('embedding');

    requestAnimationFrame(function() {
      masthead.embed.querySelector('input').select();
    });

  }

  function unravel(v) {
    var meta = v.split(':');
    return 60 * parseInt(meta[0]) + parseInt(meta[1]);
  }

  function formatDuration(v) {
    var minutes = ~~(v / 60) || 0;
    var seconds = digits((v - minutes * 60 + 0.5) << 0, 2);
    if (typeof seconds === 'number' && !(seconds < 0)
      && !(seconds > 0) && !(seconds === 0)) {
      seconds = '00';
    }
    if (/60/.test(seconds)) {
      minutes += 1;
      seconds = '00';
    }
    return minutes + ':' + seconds;
  }

  function digits(v, l) {
    var str = v + '';
    var r = '';
    for (var i = 0; i < l - str.length; i++) {
      r += '0';
    }
    return r + str;
  }

  function debounce(func, time) {
    var timeout;
    return function() {
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(func, time);
    };
  }

})();
