function Interface( bars, maxTracks ) {

  var size = Interface.Resolution;
  var styles = Interface.Styles;
  var divisions = Interface.Divisions;
  var i;

  this.two = new Two({
    type: Two.Types.canvas,
    width: size,
    height: size,
    ratio: 1
    // smoothing: false
  });

  var height = size - styles.leading * 2;
  var width = size;

  this.bars = this.two.makeGroup();

  for ( i = 0; i < bars; i++ ) {

    for ( var j = 0; j < divisions; j++ ) {

      var pct = j / divisions;
      var x = this.two.width * ( i + pct ) / bars;
      var bar = this.two.makeLine( 0, 0, 0, height );

      if (j <= 0) {
        bar.linewidth = 0.66;
      } else if ( ( j % ( divisions / 2 ) ) ) {
        bar.linewidth = 0.2;
      } else {
        bar.linewidth = 0.5;
      }

      bar.translation.x = x;
      bar.visible = false;
      this.bars.add( bar );

    }

  }

  this.tracks = this.two.makeGroup();
  for ( i = 0; i < maxTracks; i++ ) {

    var y = height * ( i + 0.5 ) / maxTracks;
    var track = new Two.Line( 0, 0, 0, 0 );

    this.tracks.add( track );

  }

  this.cursor = this.two.makeRectangle(0, height / 2, 0, height);
  this.cursor.noFill();
  this.cursor.size = this.cursor.width = 2;

  this.frame = this.two.makeRectangle(width / 2, height / 2, width, height);
  this.frame.linewidth = 0.5;
  this.frame.noFill();

  this.title = this.two.makeText( 'WHAT YOU DON’T KNOW', 0, 0, styles );
  this.title.translation.x = styles.leading * 0.125;
  this.title.translation.y = this.two.height - styles.leading * 0.5;
  this.title.baseline = 'bottom';
  this.title.alignment = 'left';

  this.section = this.two.makeText( '', 0, 0, styles );
  this.section.translation.x = this.two.width - styles.leading * 0.125;
  this.section.translation.y = this.two.height - styles.leading * 0.5;
  this.section.baseline = 'bottom';
  this.section.alignment = 'right';

  this.message = this.two.makeText( '', size / 2, size / 2, styles );
  this.message.fill = '#fff';
  this.message.stroke = '#000';
  // this.message.baseline = 'middle';
  // this.message.stroke = new Two.LinearGradient(0, 0, 0, 0, [
  //   new Two.Stop(0, '#fff'),
  //   new Two.Stop(1, '#000')
  // ]);

}

Interface.Styles = {
  family: 'alternate-gothic-no-3-d',
  weight: 400,
  size: 13,
  leading: 15
};

Interface.Divisions = 16;
Interface.Resolution = 256;
Interface.StylesInjected = false;

Interface.useDefaultStyles = function( callback ) {

  if ( Interface.StylesInjected ) {
    return;
  }

  var link = document.createElement( 'link' );
  link.onload = function() {
    if ( callback ) {
      callback();
    }
  };
  link.setAttribute( 'rel', 'stylesheet' );
  link.setAttribute( 'href', 'https://use.typekit.net/cjj0tob.css' );
  document.head.appendChild(link);
  Interface.StylesInjected = true;

};

Interface.prototype.update = function( pct ) {

  var i;

  this.cursor.translation.x = pct * this.two.width;
  // Keep the cursor visible within the bounds of the frame
  // at all times the interface is active.
  this.cursor.translation.x -= pct * this.cursor.size / 2;

  if ( this.bars.visible ) {

    for ( i = 0; i < this.bars.children.length; i++ ) {
      var bar = this.bars.children[ i ];
      bar.visible = this.cursor.translation.x >= bar.translation.x;
    }

  }

  if ( this.tracks.visible ) {

    for ( i = 0; i < this.tracks.children.length; i++ ) {

      var track = this.tracks.children[ i ];

      if ( !track.visible ) {
        continue;
      }

      track.vertices[ 1 ].x = this.cursor.translation.x;

      if ( this.cursor.visible ) {
        track.vertices[ 1 ].x -= this.cursor.size / 2;
      }

    }

  }

  if ( this.message.visible && this.message.value ) {

    this.message.scale = 1;  // Reset

    var rect = this.message.getBoundingClientRect(true);
    var scale = Math.min(this.two.width / rect.width, this.two.height / rect.height);

    this.message.scale = scale;
    this.message.linewidth = 1 / scale;

    // this.message.stroke.left.x = pct * rect.width - rect.width / 2 - 0.001;
    // this.message.stroke.right.x = pct * rect.width - rect.width / 2 + 0.001;

  }

  this.two.update();

  return this;

};

Interface.prototype.setTracks = function( tracks ) {

  var size = Interface.Resolution;
  var styles = Interface.Styles;
  var height = size - styles.leading * 2;
  var width = size;

  for ( i = 0; i < this.tracks.children.length; i++ ) {

    var y;
    var track = this.tracks.children[ i ];

    if ( i < tracks ) {
      y = height * ( i + 0.5 ) / tracks;
      track.translation.y = y;
      track.visible = true;
    } else {
      track.visible = false;
    }

  }


  return this;

};

Interface.prototype.setSection = function( value ) {

  this.section.value = value;
  return this;

};

Interface.prototype.setMessage = function( message ) {

  this.message.value = message;
  this.message.visible = true;

  return this;

};

Interface.prototype.hideMessage = function() {

  this.message.value = '';
  this.message.visible = false;

  return this;

};

Interface.prototype.enable = function() {

  this.two.scene.opacity = 1;
  this.cursor.visible = true;

  return this;

};

Interface.prototype.disable = function() {

  this.two.scene.opacity = 0.5;
  this.cursor.visible = false;

  return this;

};
