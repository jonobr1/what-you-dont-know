/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.VRController = function () {

	THREE.Object3D.call( this );

	var scope = this;
	var gamepad;
	var mouse = new THREE.Vector2();

	var buttonIsPressed = false;

	this.matrixAutoUpdate = true;

	function findGamepad() {

		var gamepads = navigator.getGamepads && navigator.getGamepads();

		for ( var i = 0; i < 4; i ++ ) {

			var gamepad = gamepads[ i ];

			if ( gamepad && ( gamepad.id === 'Gear VR Controller' || gamepad.id === 'Oculus Go Controller' || gamepad.id === 'Daydream Controller' ) ) {

				return gamepad;

			}

		}

	}

	function mousedown(e) {

		var x = 2 * e.clientX / window.innerWidth - 1;
		var y = 2 * e.clientY / window.innerHeight - 1;

		y *= - 1;

		mouse.set(x, y);
		scope.dispatchEvent( { type: 'selectstart' } );

	}

	function mousemove(e) {

		var x = 2 * e.clientX / window.innerWidth - 1;
		var y = 2 * e.clientY / window.innerHeight - 1;

		y *= - 1;

		mouse.set(x, y);

	}

	function mouseup(e) {

		var x = 2 * e.clientX / window.innerWidth - 1;
		var y = 2 * e.clientY / window.innerHeight - 1;

		y *= - 1;

		mouse.set(x, y);
		scope.dispatchEvent( { type: 'selectend' } );

	}

	function touchstart(e) {

		var touches = e.touches;
		var touch = touches[0];

		if (touch) {

			var x = 2 * touch.clientX / window.innerWidth - 1;
			var y = 2 * touch.clientY / window.innerHeight - 1;

			y *= - 1;

			mouse.set(x, y);

		}

		scope.dispatchEvent( { type: 'selectstart' } );

	}

	function touchmove(e) {

		var touches = e.touches;
		var touch = touches[0];

		if (touch) {

			var x = 2 * touch.clientX / window.innerWidth - 1;
			var y = 2 * touch.clientY / window.innerHeight - 1;

			y *= - 1;

			mouse.set(x, y);

		}

	}

	function touchend(e) {

		var touches = e.touches;
		var touch = touches[0];

		if (touch) {

			var x = 2 * touch.clientX / window.innerWidth - 1;
			var y = 2 * touch.clientY / window.innerHeight - 1;

			y *= - 1;

			mouse.set(x, y);

		}

		scope.dispatchEvent( { type: 'selectend' } );

	}

	this.connect = function() {

		window.addEventListener('mousedown', mousedown, false);
		window.addEventListener('mousemove', mousemove, false);
		window.addEventListener('mouseup', mouseup, false);

		window.addEventListener('touchstart', touchstart, false);
		window.addEventListener('touchmove', touchmove, false);
		window.addEventListener('touchend', touchend, false);
		window.addEventListener('touchcancel', touchend, false);

		return this;

	};

	this.disconnect = function() {

		window.removeEventListener('mousedown', mousedown, false);
		window.removeEventListener('mousemove', mousemove, false);
		window.removeEventListener('mouseup', mouseup, false);

		window.removeEventListener('touchstart', touchstart, false);
		window.removeEventListener('touchmove', touchmove, false);
		window.removeEventListener('touchend', touchend, false);
		window.removeEventListener('touchcancel', touchend, false);

		return this;

	};

	this.update = function () {

		gamepad = findGamepad();

		if ( gamepad !== undefined && gamepad.pose !== undefined ) {

			var pose = gamepad.pose;

			if ( pose === null ) return; // no user action yet

			//  orientation

			if ( pose.orientation !== null ) scope.quaternion.fromArray( pose.orientation );

			scope.updateMatrix();
			scope.visible = true;

			if ( gamepad.id === 'Daydream Controller' ) {

				if ( buttonIsPressed !== gamepad.buttons[ 0 ].pressed ) {

					buttonIsPressed = gamepad.buttons[ 0 ].pressed;
					scope.dispatchEvent( { type: buttonIsPressed ? 'selectstart' : 'selectend' } );

				}

			} else {

				if ( buttonIsPressed !== gamepad.buttons[ 1 ].pressed ) {

					buttonIsPressed = gamepad.buttons[ 1 ].pressed;
					scope.dispatchEvent( { type: buttonIsPressed ? 'selectstart' : 'selectend' } );

				}

			}

		} else {

			scope.visible = false;

		}

	};

	this.getMouse = function() {

		return mouse;

	};

};

THREE.VRController.prototype = Object.create( THREE.Object3D.prototype );
THREE.VRController.prototype.constructor = THREE.VRController;
