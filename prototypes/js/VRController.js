/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.VRController = function () {

	THREE.Object3D.call( this );

	var scope = this;
	var gamepad;

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

};

THREE.VRController.prototype = Object.create( THREE.Object3D.prototype );
THREE.VRController.prototype.constructor = THREE.VRController;
