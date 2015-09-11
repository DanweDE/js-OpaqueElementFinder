var oef = new OpaqueElementFinder();
var infoElem = document.getElementById( 'info' );

var HOVER_CLASS = 'opaqueElemHovered';

document.documentElement.addEventListener( 'mousemove', mouseMoveHandler, false );

function mouseMoveHandler( e ) {
	renderInfo( e );
	highlightOpaqueElementAtPoint( e.clientX, e.clientY );
}

function renderInfo( e ) {
	var info = {
		target: e.target.nodeName,
		'class': e.target.getAttribute( 'class' ),
		x: e.clientX,
		y: e.clientY
	};
	infoElem.innerHTML = JSON.stringify( info, null, '\t' );
}

function highlightOpaqueElementAtPoint( x, y ) {
	var activeElem = document.getElementsByClassName( HOVER_CLASS )[ 0 ];
	if( activeElem ) {
		activeElem.className = activeElem.className.replace(
			new RegExp( '\\b\\s*' + HOVER_CLASS + '\\b', '' ), '' );
	}
	var opaqueElem = oef.opaqueElementFromPoint( x, y );
	if( opaqueElem && opaqueElem !== document.documentElement ) {
		opaqueElem.className
			= ( opaqueElem.className ? opaqueElem.className + ' ' : '' ) + HOVER_CLASS;
	}
}
