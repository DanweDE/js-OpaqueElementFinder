// Load Gulp and all of our Gulp plugins
const gulp = require( 'gulp' );
const $ = require( 'gulp-load-plugins' )();

// Load other npm modules
const del = require( 'del' );
const glob = require( 'glob' );
const path = require( 'path' );
const isparta = require( 'isparta' );
const babelify = require( 'babelify' );
const watchify = require( 'watchify' );
const buffer = require( 'vinyl-buffer' );
const esperanto = require( 'esperanto' );
const browserify = require( 'browserify' );
const runSequence = require( 'run-sequence' );
const source = require( 'vinyl-source-stream' );
const testem = require( 'testem' );
const extend = require( 'util' )._extend;

// Gather the library data from `package.json`
const manifest = require( './package.json' );
const config = manifest.babelBoilerplateOptions;
const mainFile = manifest.main;
const destinationFolder = path.dirname( mainFile );
const exportFileName = path.basename( mainFile, path.extname( mainFile ) );

const TESTEM_CI = 'startCI';
const TESTEM_DEV = 'startDev';

// Remove the built files
gulp.task( 'clean', function( cb ) {
	del( [ destinationFolder ], cb );
} );

// Remove our temporary files
gulp.task( 'clean-tmp', function( cb ) {
	del( [ 'tmp' ], cb );
} );

// Send a notification when JSCS fails,
// so that you know your changes didn't build
function jscsNotify( file ) {
	if( !file.jscs ) {
		return;
	}
	return file.jscs.success ? false : 'JSCS failed';
}

function createLintTask( taskName, files ) {
	gulp.task( taskName, function() {
		return gulp.src( files )
			.pipe( $.plumber() )
			.pipe( $.eslint() )
			.pipe( $.eslint.format() )
			.pipe( $.eslint.failOnError() )
			.pipe( $.jscs() )
			.pipe( $.notify( jscsNotify ) );
	} );
}

createLintTask( 'lint-src', [ 'src/**/*.js' ] );
createLintTask( 'lint-test', [ 'test/**/*.js' ] );
createLintTask( 'lint-demo', [ 'demo/**/*.js' ] );

// Lint everything
gulp.task( 'lint', [ 'lint-test', 'lint-src', 'lint-demo' ] );

// Build two versions of the library
gulp.task( 'build', [ 'lint-src', 'clean' ], function( done ) {
	esperanto.bundle( {
		base: 'src',
		entry: config.entryFileName,
	} ).then( function( bundle ) {
		var res = bundle.toUmd( {
			// Don't worry about the fact that the source map is inlined at this step.
			// `gulp-sourcemaps`, which comes next, will externalize them.
			sourceMap: 'inline',
			name: config.mainVarName
		} );

		$.file( exportFileName + '.js', res.code, {src: true} )
			.pipe( $.plumber() )
			.pipe( $.sourcemaps.init( {loadMaps: true} ) )
			.pipe( $.babel() )
			.pipe( $.sourcemaps.write( './' ) )
			.pipe( gulp.dest( destinationFolder ) )
			.pipe( $.filter( [ '*', '!**/*.js.map' ] ) )
			.pipe( $.rename( exportFileName + '.min.js' ) )
			.pipe( $.sourcemaps.init( {loadMaps: true} ) )
			.pipe( $.uglify() )
			.pipe( $.sourcemaps.write( './' ) )
			.pipe( gulp.dest( destinationFolder ) )
			.on( 'end', done );
	} )
		.catch( done );
} );

function bundle( bundler ) {
	return bundler.bundle()
		.on( 'error', function( err ) {
			console.log( err.message );
			this.emit( 'end' );
		} )
		.pipe( $.plumber() )
		.pipe( source( './tmp/__spec-build.js' ) )
		.pipe( buffer() )
		.pipe( gulp.dest( '' ) )
		.pipe( $.livereload() );
}

function getBundler() {
	// Our browserify bundle is made up of our unit tests, which
	// should individually load up pieces of our application.
	// We also include the browserify setup file.
	var testFiles = glob.sync( './test/unit/**/*' );
	var allFiles = [ './test/setup/browserify.js' ].concat( testFiles );

	// Create our bundler, passing in the arguments required for watchify
	var bundler = browserify( allFiles, extend( { debug: true }, watchify.args ) );

	// Set up Babelify so that ES6 works in the tests
	bundler.transform( babelify.configure( {
		sourceMapRelative: __dirname + '/src'
	} ) );

	return bundler;
};

function watchifyBundler( bundler ) {
	// Watch the bundler, and re-bundle it whenever files change
	bundler = watchify( bundler );
	bundler.on( 'update', function() {
		bundle( bundler );
	} );
	return bundler;
}

gulp.task( 'browserify', function() {
	return bundle( getBundler() );
} );

gulp.task( 'browserify-watchify', function() {
	return bundle( watchifyBundler( getBundler() ) );
} );

// Ensure that linting occurs before browserify runs. This prevents
// the build from breaking due to poorly formatted code.
gulp.task( 'build-in-sequence', function( done ) {
	runSequence( [ 'lint-src', 'lint-test' ], 'browserify', done );
} );

function startTester( mode ) {
	return function startTest() {
		( new testem() )[ mode ]( { file: 'test/setup/testem.json' } );
	}
}

gulp.task( 'test', function() {
	runSequence( [ 'lint-src', 'lint-test' ], 'browserify', startTester( TESTEM_CI ) );
} );

gulp.task( 'watch', function() {
	runSequence( [ 'lint-src', 'lint-test' ], 'browserify-watchify', startTester( TESTEM_DEV ) );
} );

// An alias of test
gulp.task( 'default', [ 'test' ] );
