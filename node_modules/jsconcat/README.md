#JSCONCAT!
	Simple lightweight file concatenation script,jams all your files into a single file, so you dont have to!
	Uses the uglify-js library for compression of javascript files if specified.
	
##Install:

	npm install jsconcat -g
	
##How to:

	Simple create a script in your projects root directory,require in the jsconcat library
	and specify the files you need to be processed.
	
##options:
	
		uglify(TRUE/FALSE): a boolean value property,a true value tells the script to use uglify 
		for compression,for js codes only.
		
		src_dir: a string specifying the location of the files to be used.
		
		build_dir: a string specifying the location to store the produced file.
		
		name: the name to call the final file produced.
		
		src: an array containing the files to be concatenated.
		
		
##Example:
  
	file:   js-build  =>
	```
		var jsconcat = require('jsConcat').JsConcat;

		var monster_engine = {
  			      uglify: true,
				src_dir : './assets/js',
				name: 'monster_engine.js',
				src:['editor.js','locker.js','sucker.js']
		};


		var curler = {
    				uglify: true,
				src_dir : './assets/js/curler',
				name: 'curler.js',
				src: ['curler.js']	
		};

		monster_engine.build_dir = curler.build_dir = " ./builds";

		jsconcat.compile(monster_engine);
		jsconcat.compile(curler);

	```
	navigate to your projects root directory in your terminal and run "node js-build" ;
