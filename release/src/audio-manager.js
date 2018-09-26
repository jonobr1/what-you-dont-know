/**
 * @class Manage multiple audio files in the form of "stem" tracks to be
 * played on top of each other and in specific sequences.
 */
function AudioManager ( bpm, bars ) {

	var ctx = WebAudio.getContext();

	if ( /number/i.test( typeof bpm ) ) {
		this.bpm = bpm;
	}
	if ( /number/i.test( typeof bars ) ) {
		this.bars = bars;
	}

	this.section = 0;
	this.tracks = [];
	this.analysers = {}; // Should be less than `tracks.length`
	this.analysers.list = [];

	this.destination = ctx.createGain();
	this.master = ctx.createGain();
	this.master.connect( ctx.destination );

	this.remainingTimeOfCurrentRep = this.getDuration();

}

AudioManager.drag = 0.125;
AudioManager.fftSize = 32;

AudioManager.prototype.startTime = null;
AudioManager.prototype.bpm = 90;
AudioManager.prototype.bars = 10;
AudioManager.prototype.isPlaying = false;
AudioManager.prototype.started = false;
AudioManager.prototype.remainingTimeOfCurrentRep = 0;
AudioManager.prototype.elapsedPercentageOfCurrentRep = 0;

/**
 * @function Add a series of WebAudio nodes to a linear track for convenient
 * sequencing.
 */
AudioManager.prototype.addTrack = function ( name, clips ) {

	var ctx = WebAudio.getContext();

	var track = new AudioManager.Track( name, clips );
	track.node.connect( this.destination );

	var key = name.replace( /\-[a-zA-Z]$/i, '' );
	if ( !( key in this.analysers ) ) {
		var analyser = AudioManager.Track.createAnalyser( ctx );
		this.analysers[ key ] = analyser;
		this.analysers.list.push( analyser );
	}

	track.node.connect( this.analysers[ key ] );
	this.tracks.push( track );

	return track;

};

/**
 * @function Initialize the AudioManager to manage playing multiple audio
 * tracks as loops.
 */
AudioManager.prototype.start = function ( time ) {

	var ctx = WebAudio.getContext();
	this.isPlaying = true;

	if ( !this.started ) {

		this.startTime = ctx.currentTime + ( time || 0 );

		for ( var i = 0; i < this.tracks.length; i++ ) {
			this.tracks[ i ].start( this.startTime );
		}

		this.destination.connect( this.master );

	}

	this.destination.gain.value = 1;
	this.started = true;

	return this;

};

/**
 * @function Get the time in seconds of when the next repitition will start.
 * This is relative to the Audio Context's `currentTime` value a.k.a. the
 * absolute clock time of the application running.
 */
AudioManager.prototype.getTimeToNextRep = function() {

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
	return startTime + duration * ( reps + 1 );

};

/**
 * @function Transition from one section of tracks to another.
 * @param {Number} [index] - The desired index to set the tracks to. If none is
 * specified then it increments to the next index.
 */
AudioManager.prototype.transition = function ( index ) {

	var to = this.getTimeToNextRep();

	for ( var i = 0; i < this.tracks.length; i++ ) {
		var track = this.tracks[ i ];
		track.transition( to, index );
	}

	return this;

};

AudioManager.prototype.set = function ( index, startPct ) {

	for ( var i = 0; i < this.tracks.length; i++ ) {

		var track = this.tracks[ i ];

		if ( track.current ) {
			track.current.pause();
		}

		track.select( index );

		if ( track.current ) {
			track.current.currentTime = startPct * track.current.duration;
			if ( track.current.paused ) {
				track.current.play();
			}
		}

	}

	return this;

};

/**
 * @function Halt the AudioManager from running. Cuts the volume, but is still
 * playing in the background in order to keep the timing of the audio tracks.
 */
AudioManager.prototype.stop = function () {

	var ctx = WebAudio.getContext();
	this.isPlaying = false;

	// this.destination.gain.value = 0;
	for ( var i = 0; i < this.tracks.length; i++ ) {
		var track = this.tracks[ i ];
		if ( track.current && !track.current.paused ) {
			track.current.pause();
		}
	}

	return this;

};

AudioManager.prototype.forceStop = function ( time ) {

	for ( var i = 0; i < this.tracks.length; i++ ) {
		var track = this.tracks[ i ];
		track.stop( time );
	}

	return this;

};

/**
 * @function returns the amount of seconds for a single repitition (rep).
 */
AudioManager.prototype.getDuration = function () {
	var duration = 4 * this.bars * ( 60 / this.bpm );
	return Math.floor(duration * 1000) / 1000;
};

AudioManager.prototype.getCurrentSection = function () {
	return this.section;
};

/**
 * @function logic that needs to be updated every frame ( animation tick ).
 */
AudioManager.prototype.update = function () {

	// Update the track's time until next repetition.
	var ctx = WebAudio.getContext();
	var currentTime = ctx.currentTime;
	var startTime = this.startTime;
	var to = this.getTimeToNextRep();
	var isAboutToSwitch = this.elapsedPercentageOfCurrentRep > 0.999;

	this.remainingTimeOfCurrentRep = to - currentTime;
	this.elapsedPercentageOfCurrentRep = 1
		- this.remainingTimeOfCurrentRep / this.getDuration();

	for ( var i = 0; i < this.tracks.length; i++ ) {

		var track = this.tracks[ i ];
		var analyser = this.analysers.list[ i ];

		if ( isAboutToSwitch && this.section !== track.index ) {
			this.section = track.index;
		}

		if ( analyser && this.isPlaying ) {
			// Update the track's fft data for visualizing.
			analyser.getByteFrequencyData( analyser.data );	// 0 - 255
		}

		// Update the track's volume.
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

	for ( var i = 0; i < clips.length; i++ ) {
		var clip = clips[ i ];
		if ( clip && !clip.connected ) {
			clip.connect( this.node );
			clip.connected = true;
		}
	}

	this.current = this.clips[ this.index ];

};

AudioManager.Track.createAnalyser = function( ctx ) {

	var analyser = ctx.createAnalyser();
	analyser.fftSize = AudioManager.fftSize;
	analyser.data = new Uint8Array( analyser.frequencyBinCount );

	return analyser;

};

/**
 * @function Begin playing a node from the track.
 */
AudioManager.Track.prototype.start = function ( startTime ) {

	if ( !this.current ) {
		return;
	}

	var ctx = WebAudio.getContext();

	if ( !this.current.loop ) {
		// TODO: Hack for the vocals...
		this.current.currentTime = 0;
	}
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
 * @function Get the next incremented index {Number} as the audio node.
 */
AudioManager.Track.prototype.next = function () {

	this.index = ( this.index + 1 ) % this.clips.length;
	this.current = this.clips[ this.index ];

	return this.current;

};

/**
 * @function Convience function to automatically switch from one audio node
 * to another on a given track.
 * @param {Seconds} time - The time in seconds to switch tracks.
 * @param {Number} index - The index of the new audio node to switch to.
 */
AudioManager.Track.prototype.transition = function ( time, index ) {

	var a = this.clips[ index ];
	var b = this.current;

	var isSameClip = a === b;
	var singlePass = ( a && !a.loop ) || ( b && !b.loop );
	var needsUpdate = !isSameClip;

	if ( needsUpdate ) {
		if ( !singlePass ) {
			this.stop( time );
		}
	}

	if ( /number/i.test( typeof index ) ) {
		this.select( index );
	} else {
		this.next();
	}

	if ( ( this.current && this.current.paused ) || needsUpdate ) {
		this.start( time );
	}

	return this;

};
