function Interaction ( renderer, camera ) {

	var scope = this;
	var touching = false;

	THREE.Group.call( this );

	this.renderer = renderer;
	this.camera = camera;

	this.mouse = new THREE.Vector2().copy( Interaction.Offscreen );
	this.searchables = [];
	this.intersections = {};
	this.raycaster = new THREE.Raycaster();

	this.mousedown = function ( event ) {

		console.log( 'mousedown' );

		var mouse = scope.mouse;
		var item = scope.intersections.mouse ;

		if ( item ) {
			item.object.dispatchEvent( {
				type: 'primary-down',
				controller: mouse
			} );
		}

		scope.dispatchEvent( {
		  type: 'primary-down',
		  controller: mouse
		} );

		return this;

	};

	this.touchstart = function ( event ) {

		console.log( 'touchstart' );

		var mouse = scope.mouse;
		var item = scope.intersections.mouse;

		var rect = renderer.domElement.getBoundingClientRect();
		var touch = event.touches[ 0 ];

		touching = true;

		if ( touch ) {

			mouse.x = ( touch.clientX - rect.left ) / rect.width;
			mouse.y = ( touch.clientY - rect.top ) / rect.height;

			mouse.x = 2 * mouse.x - 1;
			mouse.y = - 2 * mouse.y + 1;

		}

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
			isTouch: true
		} );

		return this;

	};

	this.mousemove = function ( event ) {

		console.log( 'mousemove' );

		var mouse = scope.mouse;
		var rect = renderer.domElement.getBoundingClientRect();

		mouse.x = ( event.clientX - rect.left ) / rect.width;
		mouse.y = ( event.clientY - rect.top ) / rect.height;

		mouse.x = 2 * mouse.x - 1;
		mouse.y = - 2 * mouse.y + 1;

		return this;

	};

	this.touchmove = function ( event ) {

		console.log( 'touchmove' );

		var mouse = scope.mouse;
		var item = scope.intersections.mouse;

		var rect = renderer.domElement.getBoundingClientRect();
		var touch = event.touches[ 0 ];

		if ( touching && touch ) {

			mouse.x = ( touch.clientX - rect.left ) / rect.width;
			mouse.y = ( touch.clientY - rect.top ) / rect.height;

			mouse.x = 2 * mouse.x - 1;
			mouse.y = - 2 * mouse.y + 1;

		}

		return this;

	};

	this.mouseup = function ( event ) {

		console.log( 'mouseup' );

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
		  controller: mouse
		} );

		return this;

	};

	this.touchend = function ( event ) {

		console.log( 'touchend' );

		var mouse = scope.mouse;
		var item = scope.intersections.mouse;

		var rect = renderer.domElement.getBoundingClientRect();
		var touch = event.touches[ 0 ];

		touching = false;

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
			isTouch: true
		} );

		mouse.copy( Interaction.Offscreen );

		return this;

	};

	this.connectController = function ( event ) {

		var controller = event.detail;
		scope.add( controller );

		controller.standingMatrix = renderer.vr.getStandingMatrix();

		var laser = Interaction.Laser.clone();
		controller.add( laser );
		controller.userData.laser = laser;

		function primaryPressBegan () {
			var item = scope.intersections[ controller.uuid ];
			if ( item ) {
				item.object.dispatchEvent( {
					type: 'primary-down',
					controller: controller
			  	} );
			}
			scope.dispatchEvent( {
			  type: 'primary-down',
			  controller: controller
			} );
		}

		function primaryPressEnded () {
			var item = scope.intersections[ controller.uuid ];
			if ( item ) {
				item.object.dispatchEvent( {
					type: 'primary-up',
					controller: controller
				} );
			}
			scope.dispatchEvent( {
			  type: 'primary-up',
			  controller: controller
			} );
		}

		function primaryTouchBegan () {
			var item = scope.intersections[ controller.uuid ];
			if ( item ) {
				item.object.dispatchEvent( {
					type: 'primary-touchstart',
					controller: controller
			  	} );
			}
			scope.dispatchEvent( {
			  type: 'primary-touchstart',
			  controller: controller
			} );
		}

		function primaryTouchEnded () {
			var item = scope.intersections[ controller.uuid ];
			if ( item ) {
				item.object.dispatchEvent( {
					type: 'primary-touchend',
					controller: controller
			  	} );
			}
			scope.dispatchEvent( {
			  type: 'primary-touchend',
			  controller: controller
			} );
		}

		controller.addEventListener( 'primary press began', primaryPressBegan );
		controller.addEventListener( 'primary press ended', primaryPressEnded );

		controller.addEventListener( 'primary touch began', primaryTouchBegan );
		controller.addEventListener( 'primary touch ended', primaryTouchEnded );

		// controller.addEventListener( 'touchpad axes changed', axesChanged );

		controller.addEventListener( 'disconnected', function ( event ) {

			if ( controller.parent ) {
				controller.parent.remove( controller );
			}

			controller.removeEventListener( 'primary press began', primaryPressBegan );
			controller.removeEventListener( 'primary press ended', primaryPressEnded );

			controller.removeEventListener( 'primary touch began', primaryTouchBegan );
			controller.removeEventListener( 'primary touch ended', primaryTouchEnded );

		} );

	}

}

Interaction.prototype = Object.create( THREE.Group.prototype );
Interaction.prototype.constructor = Interaction;

Interaction.Laser = new THREE.Mesh(
	new THREE.CylinderBufferGeometry( 0.001, 0.001, 1, 8, 1, true ),
	new THREE.MeshBasicMaterial({ color: 0x0c89c4 })
);
Interaction.Laser.geometry.translate( 0, 0.5, 0 );
Interaction.Laser.rotation.x = - Math.PI / 2;
Interaction.Laser.scale.y = 6;

Interaction.Offscreen = new THREE.Vector2( - 10, - 10 );

Interaction.prototype.update = function() {

	// THREE.VRController.update();

	var renderer = this.renderer;
	var list = this.searchables;
	var raycaster = this.raycaster;
	var mouse = this.mouse;

	if ( list.length <= 0 ) {
		return;
	}

	if ( renderer.vr.isPresenting() && THREE.VRController.controllers.length > 0 ) {

		for ( var i = 0; i < THREE.VRController.controllers.length; i++ ) {

			var controller = THREE.VRController.controllers[ i ];

			if ( !controller ) {
				continue;
			}

			raycaster.ray.origin.setFromMatrixPosition( controller.matrixWorld );
			raycaster.ray.direction.set( 0, 0, - 1 )
				.transformDirection( controller.matrixWorld );

			var intersects = raycaster.intersectObjects( list );

			if ( this.intersections[ controller.uuid ] ) {
				this.intersections[ controller.uuid ].object.dispatchEvent( {
					type: 'out',
					controller: controller
				} );
			}

			if ( this.intersections[ controller.uuid ] !== intersects[ 0 ] ) {
				this.intersections[ controller.uuid ] = intersects[ 0 ];
				if ( !!intersects[ 0 ] ) {
					this.intersections[ controller.uuid ].object.dispatchEvent( {
						type: 'over',
						controller: controller
					} );
				}
			}

		}

	} else {

		// No controllers available / connected

		raycaster.setFromCamera( mouse, camera );

		var intersects = raycaster.intersectObjects( list );

		if ( this.intersections.mouse ) {
			this.intersections.mouse.object.dispatchEvent( {
				type: 'out',
				controller: mouse
			} );
		}

		if ( this.intersections.mouse !== intersects[ 0 ] ) {
			this.intersections.mouse = intersects[ 0 ];
			if ( !!intersects[ 0 ] ) {
				this.intersections.mouse.object.dispatchEvent( {
					type: 'over',
					controller: mouse
				} );
				renderer.domElement.style.cursor = 'pointer';
			} else {
				renderer.domElement.style.cursor = 'default';
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
	var index = list.indexOf( obj );
	// Reset cursor style
	renderer.domElement.style.cursor = 'default';
	if ( index < 0 ) {
		return;
	}
	list.splice( index, 1 );
	return this;
};

Interaction.prototype.connect = function() {

	var renderer = this.renderer;
	this.camera.parent.add( this );

	window.addEventListener( 'vr controller connected', this.connectController );

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

	window.removeEventListener( 'vr controller connected', this.connectController );

	renderer.domElement.removeEventListener( 'mousedown', this.mousedown, false );
	renderer.domElement.removeEventListener( 'mousemove', this.mousemove, false );
	renderer.domElement.removeEventListener( 'mouseup', this.mouseup, false );

	renderer.domElement.removeEventListener( 'touchstart', this.touchstart, false );
	renderer.domElement.removeEventListener( 'touchmove', this.touchmove, false );
	renderer.domElement.removeEventListener( 'touchend', this.touchend, false );
	renderer.domElement.removeEventListener( 'touchcancel', this.touchend, false );

	return this;

};
