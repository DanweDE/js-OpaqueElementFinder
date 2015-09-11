/**
 * @author Daniel A. R. Werner <daniel.a.r.werner@gmail.com>
 */

import * as IMG_SRC from '../assets/testImageSources';
import describeOpaqueElementFromPoint, { opaqueElementFromPoint, stack, build, is }
	from './describeOpaqueElementFromPoint';

describeOpaqueElementFromPoint( 'OpaqueElementFinder.opaqueElementFromPoint( x, y )', () => {

	describe( 'on point outside the viewport', () => {

		describe( 'with no element at that point', () => {
			it( 'should return null', () => {
				expect( opaqueElementFromPoint( -9999, -9999 ) ).to.equal( null );
			} );
		} );
		describe( 'with an opaque <div> at that point', () => {
			it( 'should also return null', function() {
				var box = buildBox( is.OPAQUE_BY_BACKGROUND );
				box.style.left = '-1px';
				box.style.top = '-1px';
				stack( box );
				expect( opaqueElementFromPoint( -1, -1 ) ).to.equal( null );
			} );
		} );
	} );

	describe( 'on <img/> with different alpha (opacity) levels', () => {
		var underImg, img;

		beforeEach( () => {
			underImg = stack( buildBox( is.OPAQUE_BY_BACKGROUND ) );
			img      = stack( build4xAlphaImg() );
		} );

		it( 'should return the element under the <img/> if x/y over part with alpha(0)', () => {
			expect( opaqueElementFromPoint( 0, 0 ) ).to.equal( underImg );
		} );

		it( 'should return the <img/> if x/y over part with alpha(255)', () => {
			expect( opaqueElementFromPoint( 50, 0 ) ).to.equal( img );
		} );

		it( 'should return element under the <img/> if x/y over part with alpha(12)', () => {
			expect( opaqueElementFromPoint( 0, 50 ) ).to.equal( underImg );
		} );

		it( 'should return the <img/> if x/y over part with alpha(13)', () => {
			expect( opaqueElementFromPoint( 50, 50 ) ).to.equal( img );
		} );
	} );

	describe( 'on <img/> with transparent image but opaque background-color', () => {
		it( 'should return the <img/>', () => {
			var img = stack( buildFullAlphaImg( is.OPAQUE_BY_BACKGROUND ) );
			expect( opaqueElementFromPoint( 0, 0 ) ).to.equal( img );
		} );
	} );

	describe( 'on <img/> with opaque image but css opacity', () => {
		it( 'should return the element under the <img/>', () => {
			var underImg = stack( buildBox( is.OPAQUE_BY_BACKGROUND ) );
			stack( build4xAlphaImg( is.TRANSPARENT_BY_OPACITY ) );
			expect( opaqueElementFromPoint( 50, 0 ) ).to.equal( underImg );
		} );
	} );

	describe( 'on stretched <img/> 1.5 times the image source\'s actual size', () => {
		var underImg, img;

		beforeEach( () => {
			underImg = stack( buildBox( is.OPAQUE_BY_BACKGROUND ) );
			img      = stack( build4xAlphaImg() );
			img.setAttribute( 'height', 100 * 1.5 );
			img.setAttribute( 'width', 100 * 1.5 );
		} );

		describe( 'if x/y over stretched, transparent part', () => {
			it( 'should return the element under the <img/>', () => {
				expect( opaqueElementFromPoint( 48 * 1.5, 48 * 1.5 ) ).to.equal( underImg );
			} );
		} );
		describe( 'if x/y over stretched, opaque part', () => {
			it( 'should return the <img/> element', () => {
				expect( opaqueElementFromPoint( 52 * 1.5, 52 * 1.5 ) ).to.equal( img );
			} );
		} );
	} );

	describe( 'on css-transformed <img/> scaled to 0.5 times the image source\'s actual size', () => {
		var underImg, img;

		beforeEach( () => {
			underImg = stack( buildBox( is.OPAQUE_BY_BACKGROUND ) );
			img      = stack( build4xAlphaImg( is.SCALED_50PERCENT_EACH_SIDE ) );
		} );

		describe( 'if x/y over stretched, transparent part', () => {
			it( 'should return the element under the <img/>', () => {
				expect( opaqueElementFromPoint( 45 * 0.5, 0 ) ).to.equal( underImg );
			} );
		} );
		describe( 'if x/y over stretched, opaque part', () => {
			it( 'should return the <img/> element', () => {
				expect( opaqueElementFromPoint( 55 * 0.5, 0 ) ).to.equal( img );
			} );
		} );
	} );

	function buildBox( /* prop1, ... propN */ ) {
		return build( 'div', [ is.BOX, arguments ] );
	}
	function buildFullAlphaImg( /* prop1, ... propN */ ) {
		return build( 'img', arguments, {
			src: IMG_SRC.PNG_FULL_ALPHA
		} );
	}
	function build4xAlphaImg( /* prop1, ... propN */ ) {
		return build( 'img', arguments, {
			src: IMG_SRC.PNG_4X_ALPHA
		} );
	}

} );
