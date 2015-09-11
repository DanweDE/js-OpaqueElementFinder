/**
 * Takes an array of image sources and loads them into the browser's cache, so they are available
 * when using them in an actual <img/> tags.
 *
 * Has no handling for error cases, e.g. when the source is not existent or can not be loaded.
 *
 * @author Daniel A. R. Werner <daniel.a.r.werner@gmail.com>
 *
 * @param {string[]} imageSources
 * @param {Function} doneFn
 */
export default function preLoadImages( imageSources, doneFn ) {
	var imagesToLoad = 0;
	imageSources.forEach( ( src ) => {
		imagesToLoad++;
		let img = document.createElement( 'img' );
		img.setAttribute( 'src', src );
		img.addEventListener( 'load', ( e ) => {
			let img = e.target;
			img.parentNode.removeChild( img );
			if( --imagesToLoad === 0 ) {
				doneFn();
			}
		} );
		document.body.appendChild( img );
	} );
}
