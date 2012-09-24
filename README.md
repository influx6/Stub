# Stub 	
	A tiny lightweight Class library

# Installation
		npm install stub;

# Features
	- produces simple,lightweight Objects capable of extending down their tree
	- compatible with Nodejs
	- easily extended directly or through an ExtensionManager(https://github.com/influx6/ExtensionManager.js)
	- comes with predefined,usable extensions(Callbacks,Events,Promise,Utility extensions).
	
# Extensions
	- stub.callbacks: An extension that provides a standard callback api for evented/pub-sub 
		event triggering mechanisms with flags of added functionality
	- stub.events: An extension which uses stub.callbacks to provide a standard Pub-Sub pattern
		with the off,on and emit call styles.
	- stub.promises: A standard Promise A spec promise extension.
	- stub.su: a standard utility belt extension with about 58 shims on standard and non-standard
		functions.
		
# Examples
	'''
		In Node:
			var stub = require('stub').Stubs;
			
	
# License
	This is released under the MIT License.