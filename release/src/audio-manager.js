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

/**
 * @function Add a series of WebAudio nodes to a linear track for convenient
 * sequencing.
 */
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

/**
 * @function Initialize the AudioManager to manage playing multiple audio
 * tracks as loops.
 */
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

/**
 * @function Transition from one section of tracks to another.
 * @param {Number} [index] - The desired index to set the tracks to. If none is
 * specified then it increments to the next index.
 */
AudioManager.prototype.transition = function ( index ) {

	// Seconds of how long one repitition (rep) is.
	var duration = this.getDuration();
	var currentTime = WebAudio.getContext().currentTime;
	// The starting time of the AudioManager relative to the WebAudio context.
	var startTime = this.startTime;
	// Elapsed time in seconds.
	var elapsed = currentTime - startTime;
	// How many 10 bar clips have been played in the experience so far.
	var reps = Math.floor( elapsed / duration );
	// Time to change to next set of tracks.
	var to = startTime + duration * ( reps + 1 );

	for ( var i = 0; i < this.tracks.length; i++ ) {
		var track = this.tracks[ i ];
		track.transition( to, index );
	}

	return this;

};

/**
 * @function halt the AudioManager from running. Cuts the volume, but is still
 * playing in the background in order to keep the timing of the audio tracks.
 */
AudioManager.prototype.stop = function () {

	var ctx = WebAudio.getContext();
	this.isPlaying = false;

	this.destination.gain.value = 0;

	return this;

};

/**
 * @function returns the amount of seconds for a single repitition (rep).
 */
AudioManager.prototype.getDuration = function () {
	return 4 * this.bars * ( 60 / this.bpm );
};

/**
 * @function logic that needs to be updated every frame ( animation tick ).
 */
AudioManager.prototype.update = function () {

	// TODO: Need to calculate how much time until the next rep for visualizng.

	for ( var i = 0; i < this.tracks.length; i++ ) {
		var track = this.tracks[ i ];
		track.node.gain.value += ( track.volume - track.node.gain.value )
			* AudioManager.drag;
	}
	return this;

};

/**
 * @class A group of WebAudio nodes to be sequenced together.
 */
AudioManager.Track = function ( name, clips ) {

	var ctx = WebAudio.getContext();

	this.index = 0;
	this.name = name;
	this.clips = clips;

	this.node = ctx.createGain();
	this.volume = 1;
	this.next();

}

/**
 * @function Begin playing a node from the track.
 */
AudioManager.Track.prototype.start = function ( startTime ) {

	if ( !this.current ) {
		return;
	}

	var ctx = WebAudio.getContext();
	this.current.cue( startTime || 0, 'play' );

	return this;

};

/**
 * @function Halt playing the current node of the track.
 */
AudioManager.Track.prototype.stop = function ( endTime ) {

	if ( !this.current ) {
		return this;
	}

	var ctx = WebAudio.getContext();
	this.current.cue( endTime || 0, 'pause' );

	return this;

};

/**
 * @function Get a specific index {Number} to the current audio node.
 */
AudioManager.Track.prototype.select = function ( i ) {

	this.index = i % this.clips.length;
	this.current = this.clips[ this.index ];

	return this.current;

};

/**
 * Get the next incremented index {Number} as the audio node.
 */
AudioManager.Track.prototype.next = function () {

	this.current = this.clips[ this.index ];
	this.index = ( this.index + 1 ) % this.clips.length;

	return this.current;

};

/**
 * @function Convience function to automatically switch from one audio node
 * to another on a given track.
 * @param {Seconds} time - The time in seconds to switch tracks.
 * @param {Number} index - The index of the new audio node to switch to.
 */
AudioManager.Track.prototype.transition = function ( time, index ) {

	this.stop( time );
	if ( /number/i.test( typeof index ) ) {
		this.select( index );
	} else {
		this.next();
	}
	this.start( time );

	return this;

};
