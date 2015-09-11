/**
 * Constructor for configurable object offering the opaqueElementFromPoint() function.
 *
 * @author Daniel A. R. Werner <daniel.a.r.werner@gmail.com>
 *
 * @constructor
 */
export default function OpaqueElementFinder() {

	/**
	 * Returns the element with the highest z-index and opaque pixel at the given global
     * coordinates. Similar to document.elementFromPoint() but useful when working with partially
     * transparent images or other elements with opacity set.
     *
     * TODO: Implement several edge cases we do not yet support.
	 *
	 * @param {number} x
	 * @param {number} y
	 * @param {string|number} [opacityTolerance="0.05"] Opacity above this level is considered
	 *        as opaque enough for an element to be selected. Opacity as string or rgba alpha level
	 *        as number between 0 (fully transparent) and 255 (fully opaque).
	 * @return {HTMLElement|null}
	 */
	this.opaqueElementFromPoint = function( x, y, opacityTolerance ) {
		var alphaTolerance = normalizeAlphaLevel( opacityTolerance );
		var hiddenElemsInfo = [];
		var opaqueElement = null;
		var stackedImages = 0;

		while( true ) {
			let element = document.elementFromPoint( x, y );

			if( element === null ) {
				break;
			}
			if( !this.elementIsTransparentAtPoint( element, x, y, alphaTolerance ) ) {
				opaqueElement = element;
				break;
			}
			hiddenElemsInfo.push( {
				element: element,
				visibility: {
					value: element.style.getPropertyValue( 'visibility' ),
					priority: element.style.getPropertyPriority( 'visibility' )
				}
			} );
			element.style.setProperty( 'visibility', 'hidden', 'important' );
		}

		hiddenElemsInfo.forEach( function( info ) {
			info.element.style.setProperty( 'visibility', info.visibility.value, info.visibility.priority );
		} );

		return opaqueElement;
	};

	/**
	 * Returns whether an element is transparent at a given global coordinate.
	 *
	 * TODO: Utilize this function in a "OpacityByPointGuru" module as opacityByPoint() which
	 *  returns an element's opacity. Consider complex cases such as opacity + image with alpha.
	 *
	 * TODO: cover more cases such as transparent background but opaque border.
	 */
	this.elementIsTransparentAtPoint = function( element, x, y, alphaTolerance ) {
		alphaTolerance = normalizeAlphaLevel( alphaTolerance );
		if( element === document.documentElement ) {
			return false;
		}
		if( elementIsTransparentByOpacity( element, alphaTolerance ) ) {
			return true;
		}
		if( elementsBackgroundIsTransparent( element, alphaTolerance ) ) {
			// Even a full-alpha image is opaque if it got a non-transparent background-color.
			return element.nodeName !== 'IMG'
				|| this.imageIsTransparentAtPoint( element, x, y, alphaTolerance );
		}
		return false;
	};

	function elementIsTransparentByOpacity( element, alphaTolerance ) {
		var elementOpacity = getComputedStyle( element ).opacity;
		var elementAlpha = normalizeAlphaLevel( elementOpacity );
		return elementAlpha <= alphaTolerance ;
	}

	function elementsBackgroundIsTransparent( element, alphaTolerance ) {
		var elementBackgroundColor = getComputedStyle( element ).backgroundColor;
		var elementBackgroundAlpha = getRgbAlphaLevel( elementBackgroundColor );
		return elementBackgroundAlpha <= alphaTolerance;
	}

	function getRgbAlphaLevel( colorString ) {
		// Cover FF giving color names rather than rgb on occasion:
		if( colorString === 'transparent' ) {
			return 0;
		}
		if( /^[a-z]+$/i.test( colorString ) ) {
			return 255;
		}
		// Handle rgb(a) strings:
		var matches = colorString.match( /^rgba.*,\s*(\d\.?\d*)\s*\)$/ );
		return matches
			? normalizeAlphaLevel( matches[ 1 ] )
			: 255; // no RGBA but RGB
	}

	/**
	 * Returns whether the given image element has a non-alpha pixel at the given point.
	 *
	 * @param {HTMLImageElement} image
	 * @param {number} globalX
	 * @param {number} globalY
	 * @param {string|number} [alphaTolerance="0.1"]
	 * @return {boolean}
	 */
	this.imageIsTransparentAtPoint = function( image, globalX, globalY, alphaTolerance ) {
		alphaTolerance = normalizeAlphaLevel( alphaTolerance );
		var imgBoundaries = image.getBoundingClientRect();
		var localX = globalX - imgBoundaries.left;
		var localY = globalY - imgBoundaries.top;

		var canvasRenderingContext =  buildCanvasRenderingContextForImage( image, imgBoundaries );

		/** @var [r,g,b,a] */
		var pixel = canvasRenderingContext.getImageData( localX, localY, 1, 1 ).data;

		return pixel[ 3 ] <= alphaTolerance;
	};

	function buildCanvasRenderingContextForImage( image, imgBoundaries ) {
		var imgAsCanvas = document.createElement( 'canvas' );
		imgAsCanvas.width = imgBoundaries.width;
		imgAsCanvas.height = imgBoundaries.height;

		var canvasRenderingContext = imgAsCanvas.getContext( '2d' );
		canvasRenderingContext.drawImage( image, 0, 0, imgBoundaries.width, imgBoundaries.height );

		return canvasRenderingContext;
	}

	var lastAlphaLevelInUse = {}; // Unique initial value.
	function normalizeAlphaLevel( value ) {
		if( value === lastAlphaLevelInUse ) { // Optimization as often called with same value.
			return value;
		}
		if( value === undefined ) {
			return 12; // floor( opacity "0.05" * 255 )
		}
		switch( typeof value ) {
			case 'string':
				value = parseFloat( value );
				value = Math.floor( 255 * value );
				// @noinspection fallthrough
			case 'number':
				if( !( value <= 255 && value >= 0 ) ) {
					throw new Error( 'expected a number between 0 and 255 or a ' +
						'string representing an opacity between "0" and "1", e.g. "0.25"' );
				}
				break;
		}
		lastAlphaLevelInUse = value;
		return value;
	}
};
