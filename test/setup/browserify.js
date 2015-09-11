var config = require( '../../package.json' ).babelBoilerplateOptions;

global.mocha.setup( 'bdd' );
require( './setup' )();
global.onload = function() {
	global.mocha.checkLeaks();
	global.mocha.globals( config.mochaGlobals );
};
