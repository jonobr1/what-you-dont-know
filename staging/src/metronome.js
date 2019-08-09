function Metronome() {

  THREE.Group.call( this );

  var baseHeight = 0.025 + Math.random() * 0.0125 - 0.00625;
  var stemLength = 2.5 + Math.random() * 1 - 0.5;
  var plateSize = 0.5 + Math.random() * 0.25 - 0.125;

  this.base = new THREE.Mesh(
    Metronome.Geometries.Base, Metronome.Materials.Porcelain );

  this.base.scale.x = 1;
  this.base.scale.y = baseHeight;
  this.base.scale.z = 1;

  this.hinge = new THREE.Mesh(
    Metronome.Geometries.Pivot, Metronome.Materials.Brass );

  this.hinge.position.y = baseHeight;
  this.hinge.rotation.x = Math.PI / 2;

  this.stem = new THREE.Mesh(
    Metronome.Geometries.Stem, Metronome.Materials.Porcelain );

  this.stem.scale.y = stemLength;

  this.plate = new THREE.Mesh(
    Metronome.Geometries.Plate, Metronome.Materials.Brass.clone() );

  this.plate.position.y = stemLength;
  this.plate.rotation.x = Math.PI / 2;
  this.plate.scale.z = plateSize;
  this.plate.scale.x = plateSize;

  this.pivot = new THREE.Group();
  this.pivot.position.y = baseHeight;
  this.add( this.pivot );

  this.add( this.base );
  this.add( this.hinge );
  this.add( this.pivot );

  this.pivot.add( this.stem );
  this.pivot.add( this.plate );

}

Metronome.Geometries = {
  Base: new THREE.CylinderBufferGeometry( 0.5, 0.5, 1, 32 ),
  Pivot: new THREE.CylinderBufferGeometry( 0.1, 0.1, 0.1, 8, 1, false, Math.PI / 2, Math.PI ),
  Stem: new THREE.CylinderBufferGeometry( 0.025, 0.025, 1, 8, 1 ),
  Plate: new THREE.CylinderBufferGeometry( 1, 1, 0.025, 32, 1)
};
Metronome.Materials = {
  Porcelain: new THREE.MeshLambertMaterial({
  }),
  Brass: new THREE.MeshLambertMaterial({
    color: 'red'
  })
};

Metronome.Geometries.Base.translate( 0, 0.5, 0 );
Metronome.Geometries.Pivot.translate( 0, 0.05, 0 );
Metronome.Geometries.Stem.translate( 0, 0.5, 0 );

Metronome.prototype = Object.create( THREE.Group.prototype );
Metronome.prototype.constructor = Metronome;

Metronome.prototype.elapsed = 0;
Metronome.prototype.velocity = 0;
Metronome.prototype.range = Math.PI;
Metronome.prototype.offset = 0;

Metronome.prototype.dragging = false;

Metronome.prototype.update = function() {

  if ( this.dragging ) {
    this.offset = this.pivot.rotation.z;
    this.elapsed = 0;
  } else {
    this.elapsed += this.velocity;
    this.pivot.rotation.z = this.range * Math.sin( this.elapsed / 10 ) / 2;
    this.pivot.rotation.z += this.offset;
    this.offset -= this.offset * 0.0125;
  }

  return this;

};

Object.defineProperty( Metronome.prototype, 'swing', {

  enumerable: true,

  get: function() {
    return this.pivot.rotation.z;
  },

  set: function( rad ) {
    if ( rad > Math.PI / 2 ) {
      rad = Math.PI / 2;
    } else if ( rad < - Math.PI / 2 ) {
      rad = - Math.PI / 2;
    }
    this.pivot.rotation.z = rad;
  }

} );
