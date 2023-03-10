function Interaction ( renderer, camera ) {

	var scope = this;
	var touching = false;

	THREE.Group.call( this );

	this.renderer = renderer;
	this.camera = camera;

	this.enabled = true;
	this.autoHideControllers = false;

	this.mouse = new THREE.Vector2().copy( Interaction.Offscreen );
	this.mouse.uuid = 'mouse';

	this.searchables = [];
	this.intersections = {};
	this.controllers = { mouse: this.mouse };
	this.XRControllers = [];
	this.raycaster = new THREE.Raycaster();

	setupController( renderer.xr.getController( 0 ) );
	setupController( renderer.xr.getController( 1 ) );

	this.mousedown = function ( event ) {

		if ( !scope.enabled ) {
			return;
		}

		var mouse = scope.mouse;
		var item = scope.intersections.mouse;

		if ( item ) {
			item.object.dispatchEvent( {
				type: 'primary-down',
				controller: mouse
			} );
		}

		scope.dispatchEvent( {
		  type: 'primary-down',
		  controller: mouse,
			item: item
		} );

		return;

	};

	this.touchstart = function ( event ) {

		if ( !scope.enabled ) {
			return;
		}

		var mouse = scope.mouse;
		var rect = renderer.domElement.getBoundingClientRect();
		var touch = event.touches[ 0 ];

		mouse.isTouch = true;
		touching = true;
		event.preventDefault();

		if ( touch ) {

			mouse.x = ( touch.clientX - rect.left ) / rect.width;
			mouse.y = ( touch.clientY - rect.top ) / rect.height;

			mouse.x = 2 * mouse.x - 1;
			mouse.y = - 2 * mouse.y + 1;

		}

		scope.update();

		var item = scope.intersections.mouse;

		if ( item ) {
			item.object.dispatchEvent( {
				type: 'primary-down',
				controller: mouse,
				isTouch: true
			} );
		}

		scope.dispatchEvent( {
			type: 'primary-down',
			controller: mouse,
			isTouch: true,
			item: item
		} );

		return;

	};

	this.mousemove = function ( event ) {

		var mouse = scope.mouse;
		var rect = renderer.domElement.getBoundingClientRect();

		mouse.x = ( event.clientX - rect.left ) / rect.width;
		mouse.y = ( event.clientY - rect.top ) / rect.height;

		mouse.x = 2 * mouse.x - 1;
		mouse.y = - 2 * mouse.y + 1;

		return;

	};

	this.touchmove = function ( event ) {

		var mouse = scope.mouse;
		var item = scope.intersections.mouse;

		var rect = renderer.domElement.getBoundingClientRect();
		var touch = event.touches[ 0 ];

		// event.preventDefault();

		if ( touching && touch ) {

			mouse.x = ( touch.clientX - rect.left ) / rect.width;
			mouse.y = ( touch.clientY - rect.top ) / rect.height;

			mouse.x = 2 * mouse.x - 1;
			mouse.y = - 2 * mouse.y + 1;

		}

		return;

	};

	this.mouseup = function ( event ) {

		if ( !scope.enabled ) {
			return;
		}

		var mouse = scope.mouse;
		var item = scope.intersections.mouse;

		if ( item ) {
			item.object.dispatchEvent( {
				type: 'primary-up',
				controller: mouse
			} );
		}

		scope.dispatchEvent( {
		  type: 'primary-up',
		  controller: mouse,
			item: item
		} );

		return;

	};

	this.touchend = function ( event ) {

		if ( !scope.enabled ) {
			return;
		}

		var mouse = scope.mouse;
		var item = scope.intersections.mouse;

		var rect = renderer.domElement.getBoundingClientRect();
		var touch = event.touches[ 0 ];

		mouse.isTouch = false;
		touching = false;
		event.preventDefault();

		if ( touch ) {

			mouse.x = ( touch.clientX - rect.left ) / rect.width;
			mouse.y = ( touch.clientY - rect.top ) / rect.height;

			mouse.x = 2 * mouse.x - 1;
			mouse.y = - 2 * mouse.y + 1;

		}

		if ( item ) {
			item.object.dispatchEvent( {
				type: 'primary-up',
				controller: mouse,
				isTouch: true
			} );
		}

		scope.dispatchEvent( {
			type: 'primary-up',
			controller: mouse,
			isTouch: true,
			item: item
		} );

		mouse.copy( Interaction.Offscreen );

		return;

	};

	function setupController ( controller ) {

		scope.add( controller );

		// controller.standingMatrix = renderer.xr.getStandingMatrix();
		scope.controllers[ controller.uuid ] = controller;

		var laser = Interaction.Laser.clone();
		controller.add( laser );
		controller.userData.laser = laser;

		// TODO: Move to the controller's prototype and override `clone` method.
		laser.userData.pointer = laser.children[ 1 ];
		Object.defineProperty( laser.userData, 'scale', {
			enumerable: true,
			get: function() {
				return laser.userData.pointer.scale.y * Interaction.ScaleFactor;
			},
			set: function(v) {
				laser.userData.pointer.scale.y = v / Interaction.ScaleFactor;
			}
		} );

		function primaryPressBegan () {

			if ( !scope.enabled ) {
				return;
			}

			var item = scope.intersections[ controller.uuid ];

			if ( item ) {
				item.object.dispatchEvent( {
					type: 'primary-down',
					controller: controller
		  	} );
			}

			scope.dispatchEvent( {
			  type: 'primary-down',
			  controller: controller,
				item: item
			} );

		}

		function primaryPressEnded () {

			if ( !scope.enabled ) {
				return;
			}

			var item = scope.intersections[ controller.uuid ];

			if ( item ) {
				item.object.dispatchEvent( {
					type: 'primary-up',
					controller: controller
				} );
			}

			scope.dispatchEvent( {
			  type: 'primary-up',
			  controller: controller,
				item: item
			} );

		}

		function primaryTouchBegan () {

			if ( !scope.enabled ) {
				return;
			}

			var item = scope.intersections[ controller.uuid ];

			if ( item ) {
				item.object.dispatchEvent( {
					type: 'primary-touchstart',
					controller: controller
		  	} );
			}

			scope.dispatchEvent( {
			  type: 'primary-touchstart',
			  controller: controller,
				item: item
			} );

		}

		function primaryTouchEnded () {

			if ( !scope.enabled ) {
				return;
			}

			var item = scope.intersections[ controller.uuid ];

			if ( item ) {
				item.object.dispatchEvent( {
					type: 'primary-touchend',
					controller: controller
		  	} );
			}

			scope.dispatchEvent( {
			  type: 'primary-touchend',
			  controller: controller,
				item: item
			} );

		}

		controller.addEventListener( 'selectstart', primaryPressBegan );
		controller.addEventListener( 'selectend', primaryPressEnded );

		// controller.addEventListener( 'primary touch began', primaryTouchBegan );
		// controller.addEventListener( 'primary touch ended', primaryTouchEnded );
		scope.XRControllers.push( controller );

	}

}

Interaction.prototype = Object.create( THREE.Group.prototype );
Interaction.prototype.constructor = Interaction;
Interaction.ScaleFactor = 0.2;
Interaction.DefaultColor = 0x00ffc8;

Interaction.getDefaultController = function() {

	var aspect = 0.16 / 1;

	var geometry = new THREE.CylinderBufferGeometry( 0.16, 0.16, 1, 16, 16 );
	var positions = geometry.attributes.position;

	for ( var i = 0; i < positions.count; i++ ) {

		var id = i * 3;

		var x = positions.array[ id + 0 ];
		var y = positions.array[ id + 1 ];
		var z = positions.array[ id + 2 ];

		var ypct = ( y + 0.5 ); // [ 0 - 1 ] value
		var t = 1;
		t = Math.pow( ( ypct * 0.7 + 0.15 ), 0.33 );

		if ( ( 5 * ypct ) % 1 < 0.1 ) {
			t *= 0.8;
		}

		x *= t;
		z *= t;

		positions.array[ id + 0 ] = x;
		positions.array[ id + 2 ] = z;

	}

	var controller = new THREE.Mesh(
		geometry,
		new THREE.MeshStandardMaterial( {
			color: 0x000000,
			roughness: 0.2,
			metalness: 0.0,
			emissive: 0xff3333,
			emissiveIntensity: 0.5
		} )
	);

	// If need to change the position of the controller
	// do it here instead of trying to do it in the
	// geometry because the controller is ultimately added
	// to a group that is transformed.
	controller.rotation.x = - Math.PI / 2;

	var scale = 0.15;

	geometry = geometry.clone();
	geometry.scale( 1 + scale, 1 + scale * aspect, 1 + scale );

	var outline = new THREE.Mesh(
		geometry,
		new THREE.MeshBasicMaterial( {
			color: 0xefefef,
			side: THREE.BackSide,
			blending: THREE.AdditiveBlending,
			transparent: true
		} )
	);

	controller.add( outline );

	var pointer = new THREE.Mesh(
		new THREE.CylinderBufferGeometry( 0.005, 0.005, 1, 3, 1 ),
		// TODO: Fade teal out over distance.
		new THREE.MeshBasicMaterial( {
			color: Interaction.DefaultColor,
			side: THREE.DoubleSide,
			transparent: true,
			opacity: 0.9
		} )
	);
	pointer.geometry.translate( 0, 0.5, 0 );
	pointer.position.y += 0.5;
	pointer.scale.x = 1  / Interaction.ScaleFactor;
	pointer.scale.y = 50 / Interaction.ScaleFactor;
	pointer.scale.z = 1  / Interaction.ScaleFactor;
	controller.add( pointer );

	Object.defineProperty( controller.userData, 'scale', {
		enumerable: true,
		get: function() {
			return pointer.scale.y * Interaction.ScaleFactor;
		},
		set: function(v) {
			pointer.scale.y = v / Interaction.ScaleFactor;
		}
	} );
	controller.userData.pointer = pointer;

	controller.scale.set( Interaction.ScaleFactor, Interaction.ScaleFactor, Interaction.ScaleFactor );

	return controller;

};

Interaction.Laser = Interaction.getDefaultController();

Interaction.Offscreen = new THREE.Vector2( - 10, - 10 );

Interaction.prototype.update = function() {

	var renderer = this.renderer;
	var list = this.searchables;
	var raycaster = this.raycaster;
	var mouse = this.mouse;
	var camera = this.camera;
	var i;

	if ( list.length <= 0 || !this.enabled ) {
		return;
	}

	if ( renderer.xr.isPresenting && this.XRControllers.length > 0 ) {

		for ( i = 0; i < this.XRControllers.length; i++ ) {

			var controller = this.XRControllers[ i ];

			if ( !controller ) {
				continue;
			}

			controller.visible = true;

			// TODO: David found an error in Oculus Touch ( though this is presumably
			// with any device that supports more than one controller at a time )
			// Interactions can start with a specific hand.., but position always
			// falls on the same hand.

			raycaster.ray.origin.setFromMatrixPosition( controller.matrixWorld );
			raycaster.ray.direction.set( 0, 0, - 1 )
				.transformDirection( controller.matrixWorld );

			var intersects = raycaster.intersectObjects( list );

			if ( !!intersects[ 0 ] ) {

				if ( !this.intersections[ controller.uuid ] || this.intersections[ controller.uuid ].object !== intersects[ 0 ].object ) {

					// Update the intersection object and trigger `out` and `over`
					// events if available.

					if ( this.intersections[ controller.uuid ] ) {
						this.intersections[ controller.uuid ].object.dispatchEvent( {
							type: 'out',
							controller: controller
						} );
						controller.userData.laser.userData.scale = Interaction.Laser.userData.scale;
					}

					this.intersections[ controller.uuid ] = intersects[ 0 ];
					this.intersections[ controller.uuid ].object.dispatchEvent( {
						type: 'over',
						controller: controller
					} );
					controller.userData.laser.userData.scale = intersects[0].distance;

				} else {

					// Update the intersection point position,
					// even though the object hasn't changed.

					this.intersections[ controller.uuid ] = intersects[ 0 ];

				}

			} else {

				// Remove intersection object

				if ( this.intersections[ controller.uuid ] ) {
					this.intersections[ controller.uuid ].object.dispatchEvent( {
						type: 'out',
						controller: controller
					} );
					controller.userData.laser.userData.scale = Interaction.Laser.userData.scale;
				}

				this.intersections[ controller.uuid ] = null;

			}

		}

	} else {

		// No controllers available / connected

		raycaster.setFromCamera( mouse, camera );

		var intersects = raycaster.intersectObjects( list );

		if ( !!intersects[ 0 ] ) {

			if ( !this.intersections.mouse || this.intersections.mouse.object !== intersects[ 0 ].object ) {

				// Update the intersection object and trigger `out` and `over`
				// events if available.

				if ( this.intersections.mouse ) {
					this.intersections.mouse.object.dispatchEvent( {
						type: 'out',
						controller: mouse
					} );
				}

				this.intersections.mouse = intersects[ 0 ];
				this.intersections.mouse.object.dispatchEvent( {
					type: 'over',
					controller: mouse
				} );

			} else {

				// Update the intersection point position,
				// even though the object hasn't changed.

				this.intersections.mouse = intersects[ 0 ];

			}

			renderer.domElement.style.cursor = 'pointer';

		} else {

			// Remove intersection object

			if ( this.intersections.mouse ) {
				this.intersections.mouse.object.dispatchEvent( {
					type: 'out',
					controller: mouse
				} );
			}

			this.intersections.mouse = null;
			renderer.domElement.style.cursor = 'default';

		}

		if ( this.autoHideControllers ) {

			for ( i = 0; i < this.XRControllers.length; i++ ) {

				var controller = this.XRControllers[ i ];
				if ( !controller ) {
					continue;
				}

				controller.visible = false;

			}

		}

	}

};

Interaction.prototype.listen = function ( obj ) {
	var list = this.searchables;
	var index = list.indexOf( obj );
	if ( index >= 0 ) {
		return;
	}
	list.push( obj );
	return this;
};

Interaction.prototype.ignore = function ( obj ) {
	var list = this.searchables;
	var renderer = this.renderer;
	var index = list.indexOf( obj );
	// Reset cursor style
	renderer.domElement.style.cursor = 'default';
	if ( index < 0 ) {
		return;
	}
	list.splice( index, 1 );
	return this;
};

Interaction.prototype.hasIntersections = function () {

	for ( var uuid in this.intersections ) {
		var intersections = this.intersections[ uuid ];
		if ( intersections ) {
			return true;
		}
	}

	return false;

};

Interaction.prototype.vibrate = function ( value, duration ) {

	var renderer = this.renderer;

	for ( var i = 0; i < 2; i ++ ) {

		var controller = renderer.xr.getController( i );
		var gamepad = controller.userData.gamepad;

		if ( gamepad ) {

			var hapticActuators = gamepad.hapticActuators;

			if ( hapticActuators && hapticActuators.length > 0 ) {

				gamepad.hapticActuators[ 0 ].pulse( value, duration );

			}

		}

	}

};

Interaction.prototype.connect = function() {

	var renderer = this.renderer;
	this.camera.parent.add( this );

	renderer.domElement.addEventListener( 'mousedown', this.mousedown, false );
	renderer.domElement.addEventListener( 'mousemove', this.mousemove, false );
	renderer.domElement.addEventListener( 'mouseup', this.mouseup, false );

	renderer.domElement.addEventListener( 'touchstart', this.touchstart, false );
	renderer.domElement.addEventListener( 'touchmove', this.touchmove, false );
	renderer.domElement.addEventListener( 'touchend', this.touchend, false );
	renderer.domElement.addEventListener( 'touchcancel', this.touchend, false );

	return this;

};

Interaction.prototype.disconnect = function() {

	var renderer = this.renderer;
	this.camera.parent.remove( this );

	renderer.domElement.removeEventListener( 'mousedown', this.mousedown, false );
	renderer.domElement.removeEventListener( 'mousemove', this.mousemove, false );
	renderer.domElement.removeEventListener( 'mouseup', this.mouseup, false );

	renderer.domElement.removeEventListener( 'touchstart', this.touchstart, false );
	renderer.domElement.removeEventListener( 'touchmove', this.touchmove, false );
	renderer.domElement.removeEventListener( 'touchend', this.touchend, false );
	renderer.domElement.removeEventListener( 'touchcancel', this.touchend, false );

	return this;

};

Interaction.prototype.reset = function() {

	for ( var cid in this.intersections ) {

		var intersection = this.intersections[ cid ];

		if ( intersection ) {
			intersection.object.dispatchEvent( {
				type: 'out',
				controller: this.controllers[ cid ]
			} );
		}

	  this.intersections[ cid ] = null;

	}
	return this;

};
