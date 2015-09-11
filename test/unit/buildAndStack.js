/**
 * Returns a function to append (stack) one or more HTMLElement nodes onto a previously specified
 * parent.
 *
 * TODO: Might make sense to distribute as separate module though the overall use-case is quite
 *  specific to making this module's tests more expressive.
 *
 * @author Daniel A. R. Werner <daniel.a.r.werner@gmail.com>
 *
 * @param {HTMLElement} stackWrapper
 * @return {Function} The function for stacking other elements (appending them as children).
 */
export function stacker( stackWrapper ) {
	if( !( stackWrapper instanceof HTMLElement ) ) {
		throw new Error( 'stackWrapper has to be a HTMLElement' );
	}

	/**
	 * Stacks given elements on top of each other onto the stackWrapper element.
	 *
	 * @param {...HTMLElement|...HTMLElement[]} element
	 * @return {HTMLElement|HTMLElement[]} The given element(s).
	 */
	return function stack( element ) {
		var stacked = [];
		for( var i = 0; i < arguments.length; i++ ) {
			var currentElem = arguments[ i ];
			if( !( currentElem instanceof HTMLElement ) ) {
				var added = stack.apply( null, currentElem );
				added instanceof HTMLElement
					? stacked.push( added )
					: stacked = stacked.concat( added );
			} else {
				stackWrapper.appendChild( currentElem );
				stacked.push( currentElem );
			}
		}
		return arguments.length === 1 ? element : undefined;
	};
}

/**
 * Returns a function which is a tiny HTMLElement builder.
 *
 * @author Daniel A. R. Werner <daniel.a.r.werner@gmail.com>
 *
 * @param {string} [propertiesPrefix] An optional prefix for css classes from properties.
 * @return {Function}
 */
export function builder( propertiesPrefix ) {
	propertiesPrefix = propertiesPrefix || '';

	/**
	 * Allows building elements of a specified type with given attributes and takes a list of
	 * "properties" which describe the element further.
	 * These "properties" are simply translated into CSS classes, which will be added to the
	 * element's class list.
	 *
	 * @param {string} elementType
	 * @param {string|string[]} [properties]
	 * @param {Object} [attributes]
	 * @return {HTMLElement}
	 */
	return function build( elementType, properties = [], attributes = {} ) {
		if( properties && typeof properties.length !== 'number' ) { // No properties but attributes.
			attributes = properties;
			properties = [];
		}
		var elem = document.createElement( elementType );

		for( var name in attributes ) {
			elem.setAttribute( name, attributes[ name ] );
		}
		elem.className = ( elem.className ? ' ' : '' ) + classesFromProperties( properties );
		return elem;
	};

	function classesFromProperties(  /* prop1OrPropArray1, ... propNOrPropArrayN */ ) {
		var properties = [];
		for( var i = 0; i < arguments.length; i++ ) {
			var val = arguments[ i ];
			if( typeof val === 'string' ) {
				properties.push( `${propertiesPrefix}${val}` );
			} else { // nested values (array)
				properties = properties.concat( classesFromProperties.apply( null, val ) );
			}
		}
		return properties.join( ' ' );
	}
}
