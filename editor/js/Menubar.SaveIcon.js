/**
 * @author jonobr1 / http://jonobr1.com/
 */

Menubar.SaveIcon = function ( editor ) {

  var signals = editor.signals;

  var container = new UI.Div();

  container.setId( 'save-icon' );
  container.setClass( 'menu' );

  for ( var name in editor.signals ) {

    var signal = editor.signals[ name ];
    signal.add( mark );

  }

  function mark() {

    container.addClass( Menubar.SaveIcon.DirtyMarker );

  }

  return container;

};

Menubar.SaveIcon.DirtyMarker = 'dirty';
