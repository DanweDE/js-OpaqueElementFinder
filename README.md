# OpaqueElementFinder

Offers opaqueElementFromPoint(), same as document.elementFromPoint() but ignoring transparent objects at that point.

Can for example be used to fast implement menu bars using partially transparent PNG images as menu buttons.
In some cases, using SVG or Canvas directly might be more appropriate but this library still allows you to prototype some ideas in no time. 

## Usage

```
var oef = new OpaqueElementFinder();

var opaqueElementFromPoint = oef.opaqueElementFromPoint.bind( oef ); // optional

// Get element at x:1337, y:42 which is not transparent at that global coordinate: 
opaqueElementFromPoint( 1337, 42 )

// Same, but consider an opacity of 0.5 (alpha 127) as transparent.
opaqueElementFromPoint( 1337, 42, "0.5" )
opaqueElementFromPoint( 1337, 42, 127 )
```

## Which Elements are Considered Opaque?

Determining whether an object is opaque or transparent at a certain point can become very complex in certain edge cases.
This library covers some basic cases and might be extended to cover other cases at a later point.

### Covered Cases
* Transparent PNG and GIF images' as img-element's `src`.
* Element's `background-color`.
    * `rgba()`, `rgb()`, `#rgb`
    * color names (`transparent`, `red`, etc.)
* Element's `opacity`.
* *...and combinations of the above to some extent*

### Cases not (yet) Covered
* Combinations of `opacity`, `rgba()` and partially transparent images where the actual opacity level had to be calculated. Instead all of these have to be considered transparent for the element to be considered transparent.
* Canvas elements.
* Transparent elements with non-transparent borders. Borders will be considered transparent if the element is considered transparent.
* Padding on img-elements confuses calculation (**urgent**)
* Transparent elements containing text. The text might not be transparent but the whole element is considered transparent anyhow. 
* ...

## TODOS
* Improve on opacity detection cases (cases above).
* Extract some functionality in separate library for determining the opacity of an element at a certain point.
* Add a `bower.json`.
* More tests and CI infrastructure.
    * Dynamically generate a list of working cases and their browser support.