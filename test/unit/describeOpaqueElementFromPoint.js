/**
 * @author Daniel A. R. Werner <daniel.a.r.werner@gmail.com>
 */

import OpaqueElementFinder from '../../src/OpaqueElementFinder';
import { builder, stacker } from './buildAndStack';
import preLoadImages from './preLoadImages';
import * as testImageSources from '../assets/testImageSources';
import * as testElementsProperties from '../assets/testElementsProperties';
export var is = testElementsProperties;

/** @var HTMLElement */
var testSurface;

/** @var {Function} */
export var opaqueElementFromPoint;

/** @var {Function} */
export var stack;

/** @var {Function} */
export var build = builder( 'test-' );

/**
 * Sets up an environment for describing the opaqueElementFromPoint function.
 *
 * @param {string} msg
 * @param {Function} fn
 */
export default function describeOpaqueElementFromPoint( msg, fn ) { describe( msg, () => {

	var imagesLoaded = false;

	before( ( done ) => {
		if( !imagesLoaded ) {
			var imageSources = [];
			for( let name in testImageSources ) {
				imageSources.push( testImageSources[ name ] );
			}
			preLoadImages( imageSources, done );
		} else {
			done();
		}
	} );

	beforeEach( () => {
		var oef = new OpaqueElementFinder();
		opaqueElementFromPoint = oef.opaqueElementFromPoint.bind( oef );

		testSurface = build( 'div' );
		testSurface.setAttribute( 'id', 'test-surface' );
		document.body.insertBefore( testSurface, document.body.firstChild ); // insert before Mocha

		stack = stacker( testSurface );
	} );

	afterEach( function() {
		testSurface.parentNode.removeChild( testSurface );
	} );

	return fn();
} ); }
