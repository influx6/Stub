# Stub 	
	A tiny lightweight Class library

# Installation
		npm install stub;

# Features
	- produces simple,lightweight Objects capable of extending down their tree
	- compatible with Nodejs
	- easily extendable directly or through an ExtensionManager(https://github.com/influx6/ExtensionManager.js)
	- comes with predefined,usable extensions(Callbacks,Events,Promise,Utility extensions).
	
# Extensions
	- stub.callbacks: An extension that provides a standard callback api for evented/pub-sub 
		event triggering mechanisms with flags for added functionality
	- stub.events: An extension which uses stub.callbacks to provide a standard Pub-Sub pattern
		with the off,on and emit call styles.
	- stub.promises: A standard Promise A spec.
	- stub.su: a standard utility belt extension with about 58 shims on standard and non-standard
		functions.
		
# Examples
	'''
		In Node:
			var stub = require('stub').Stubs;
			
			//option for when desiring to use extensions
			var extmgr = require("extensionmgr");
			
			//to create an example Class
			var Library = stub.create("Library",{
				init: function(){},
				addBooks: function(){}
			});
			
			/* to use available extensions(Promise,Events,Utility,etc)
			* copy or add your extensions in the same format and style as the defaults
			* in a folder to access them through,
			* default extensions for stub,eg Promises are located in the extensions folder,
			* when using extension order is important,also ensure to define explicity, when
			* creating your extensions that you state all dependencies directly access by the extension
			*  you can add them onto your class or to stub,or let the extension manager handle them and
			* simple call them from the extension manager
			*/
			
			//to add directly to stub ,look to ExtensionManager ReadMe for more detailed information
			
		    //require('stub/extensions/stub.su')(extmgr(stub));
			//the reason we are using stub/extensions in the require above,is because the directories have being listed
			//in stub package.json file,therefore we can gain access to that directory through this format.
			
			//to add directly to Library
			//require('stub/extensions/stub.su')(extmgr(Library));
			
			//to let extmgr handle all extensions,don't pass any argument,when calling extmgr
			//require('stub/extensions/stub.su')(extmgr()); //extmgr will have a cache of the loaded extensions
			
			require('stub/extensions/stub.su')(extmgr());			
			require('stub/extensions/stub.callbacks')(extmgr(Library));
			require('stub/extensions/stub.events')(extmgr(Library));
			require('stub/extensions/stub.promise')(extmgr(Library));
			
			Library.Callbacks //=> will return the callback object
			Library.Promie //=> will return the promise object and so on.
			
		In Browser: simple include the scripts as needed
				
				....
				<script src="paths to ../stub.min.js"></script>
				<script src="paths to../extmgr.min.js"></script>
				<script src="paths to../extensions/stub.su.js"></script>
				<script src="paths to../extensions/stub.callbacks.js"></script>
				<script src="paths to../extensions/stub.promises.js"></script>
				<script src="paths to../extensions/stub.events.js"></script>
				<script>
					//variables like Promise,Events,Callbacks,SU will be leaked into the global scope
					
					var Library = stub.create("Library",{
						init: function(){},
						addBooks: function(){}
					});
					
					var exts = ExtensionManager(Library); // returns an extensionmanager object,set to extend 
																// Library
																
					Promise(exts); Callbacks(exts); Events(exts); SU(exts);
					 //Library will now have all these extensions
					
					or 
					
					var exts = ExtensionManager(); // returns an extensionmanager object,set to extend 
					Promise(exts); Callbacks(exts); Events(exts); SU(exts);
					
					exts.give(false,Library,"Callback","Promise");
					
						
				</script>
			 
			  ....
			
			
	'''
	
# License
	This is released under the MIT License.