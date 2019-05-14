/**
 * @author jonobr1 / http://jonobr1.com/
 */

Menubar.SaveIcon = function ( editor ) {

  var signals = editor.signals;

  var container = new UI.Div();

  container.setId( 'save-icon' );
  container.setClass( 'menu' );

  return container;

};

Menubar.SaveIcon.DirtyMarker = 'dirty';
