/**
 * @author mrdoob / http://mrdoob.com/
 */

var Menubar = function ( editor ) {

	var container = new UI.Panel();
	container.setId( 'menubar' );

	container.saveIcon = new Menubar.SaveIcon( editor );

	container.add( container.saveIcon );
	container.add( new Menubar.File( editor ) );
	container.add( new Menubar.Edit( editor ) );
	container.add( new Menubar.Examples( editor ) );
	container.add( new Menubar.Help( editor ) );

	return container;

}
