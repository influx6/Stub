var jsconcat = require("jsconcat").compile,
	
	extmgr = {		
		name: "extensionmgr.js",
		src_dir: ".",
		src:["../extensionmgr/extensionmgr.js"],
		build_dir: "./node_modules",
		uglify: false
	},
	
	stub = {
		name: "stub.min.js",
		src_dir: ".",
		src:["src/stub.js"],
		build_dir: ".",
		uglify: true
	};

   jsconcat(stub);
   jsconcat(extmgr);
