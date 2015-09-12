# OpaqueElementFinder

Offers opaqueElementFromPoint(), same as document.elementFromPoint() but ignoring transparent objects at that point.

Can for example be used to fast implement menu bars using partially transparent PNG images as menu buttons.
In some cases, using SVG or Canvas directly might be more appropriate but this library still allows you to prototype some ideas in no time. 

## Usage

```
var oef = new OpaqueElementFinder();

var opaqueElementFromPoint = oef.opaqueElementFromPoint.bind( oef ); // optional

// Get element at x:1337, y:42 which is not transparent at that global coordinate: 
opaqueElementFromPoint( 1337, 42 );

// Same, but consider an opacity of 0.5 (alpha 127) as transparent.
opaqueElementFromPoint( 1337, 42, "0.5" );
opaqueElementFromPoint( 1337, 42, 127 );
```

You can also find a little demonstration at `demo/index.html`.

## Which Elements are Considered Opaque?

Determining whether an object is opaque or transparent at a certain point can become very complex in certain edge cases.
This library covers some basic cases and might be extended to cover other cases at a later point.

### Covered Cases
* Transparent PNG and GIF images' as img-element's `src`.
    * Images transformed by css3 transformation `scale()`.
    * Images scaled by `width` and `height` different from original resolution`.
* Element's `background-color`.
    * `rgba()`, `rgb()`, `#rgb`
    * color names (`transparent`, `red`, etc.)
* Element's `opacity`.
* *...and combinations of the above to some extent*

### Cases not (yet) Covered
* Combinations of `opacity`, `rgba()` and partially transparent images where the actual opacity level had to be calculated. Instead all of these have to be considered transparent for the element to be considered transparent.
* Canvas elements.
* Transparent elements with non-transparent borders. Borders will be considered transparent if the element is considered transparent.
* Padding on img-elements confuses calculation. (**urgent**)
* Transparent elements containing opaque text. Currently the whole element is considered transparent, ignoring the text color.
    * This might be the trickiest case and not worth the trouble if reliably possible at all.
* css3 transformation types other than scale applied on images.
* ...

## Development
Gulp is used for building and other tasks. Some tasks are:
* `gulp build` - for building the `dist/` folder for publishing the library in UMD style.
* `gulp lint` - for linting all sources.
* `gulp test` - runs browser tests once with [testem](https://github.com/airportyh/testem).
* `gulp watch` - continuously runs browser tests with testem.

## TODOs
* Improve opacity detection.
    * Implement more of the cases above.
    * Extract some functionality in separate library for determining the opacity of an element at a certain point.
* Add a `bower.json`.
* More tests and CI infrastructure.
    * Dynamically generate a list of working cases and their browser support.
