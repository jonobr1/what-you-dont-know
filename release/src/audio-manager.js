function AudioManager ( bpm, bars ) {

	var ctx = WebAudio.getContext();

	if ( /number/i.test( typeof bpm ) ) {
		this.bpm = bpm;
	}
	if ( /number/i.test( typeof bars ) ) {
		this.bars = bars;
	}

	this.tracks = [];
	this.clips = [];

	this.destination = ctx.createGain();
	this.master = ctx.createGain();
	this.master.connect( ctx.destination );

}

AudioManager.drag = 0.125;

AudioManager.prototype.startTime = null;
AudioManager.prototype.bpm = 90;
AudioManager.prototype.bars = 10;
AudioManager.prototype.isPlaying = false;
AudioManager.prototype.started = false;

AudioManager.prototype.addTrack = function ( name, clips ) {

	var track = new AudioManager.Track( name, clips );
	track.node.connect( this.destination );

	for ( var i = 0; i < clips.length; i++ ) {
		var clip = clips[ i ];
		clip.connect( track.node );
	}

	this.tracks.push( track );
	this.clips.concat( clips );

	return track;

};

AudioManager.prototype.start = function () {

	var ctx = WebAudio.getContext();
	this.isPlaying = true;

	if ( !this.started ) {

		this.startTime = ctx.currentTime;

		for ( var i = 0; i < this.tracks.length; i++ ) {
			this.tracks[ i ].start();
		}

		this.destination.connect( this.master );

	}

	this.destination.gain.value = 1;
	this.started = true;

	return this;

};

AudioManager.prototype.stop = function () {

	var ctx = WebAudio.getContext();
	this.isPlaying = false;

	this.destination.gain.value = 0;

	return this;

};

AudioManager.prototype.getDuration = function () {
	return 4 * this.bars * ( 60 / this.bpm );
};

AudioManager.prototype.update = function () {

	for ( var i = 0; i < this.tracks.length; i++ ) {
		var track = this.tracks[ i ];
		track.node.gain.value += ( track.volume - track.node.gain.value )
			* AudioManager.drag;
	}
	return this;

};

AudioManager.Track = function ( name, clips ) {

	var ctx = WebAudio.getContext();

	this.index = 0;
	this.name = name;
	this.clips = clips;

	this.node = ctx.createGain();
	this.volume = 1;
	this.next();

}

AudioManager.Track.prototype.start = function ( startTime ) {

	if ( !this.current ) {
		return;
	}

	var ctx = WebAudio.getContext();
	this.current.cue( startTime || 0, 'play' );

	return this;

};

AudioManager.Track.prototype.stop = function ( endTime ) {

	if ( !this.current ) {
		return this;
	}

	var ctx = WebAudio.getContext();
	this.current.cue( endTime || 0, 'pause' );

	return this;

};

AudioManager.Track.prototype.next = function () {

	this.current = this.clips[ this.index ];
	this.index = ( this.index + 1 ) % this.clips.length;

	return this.current;

};

AudioManager.Track.prototype.transition = function ( time ) {

	this.stop( time );
	this.next();
	this.start( time );

	return this;

};
