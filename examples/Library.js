//a simple example class using Stub,a Simple library

var Catalogue = Stubs.create("Catalogue",{
	
	init: function(){
		this.catalogue={};
		this.log=[];
		this.paint = false;
	},
	 
	addCatalogue: function(name,catalogue){
		this.catalogue[name]=catalogue;
	},
	
	removeCatalogue: function(name){
		if(!name || !this.catalogue[name]){
			throw new Error();
		}
		delete this.catalogue[name];
	},
	
	getCatalogues: function(){
		console.log("Calling super!");
		return this.catalogue;
	},
	
	getPaint: function(){
		return this.paint;
	},
	
	getLog: function(){
		return this.log;
	}
	
});

var Library = Stubs.create("Library",{
	init: function(settings){
		this.settings = settings;
		this.bookLists=[];
	},
	
	addBook: function(book,catalogue){
		this.triggerEvent('change');
	},
	
	removeBook: function(){},
		
	getBooks: function(){},
	
	getCatalogues: function(){
		console.log(this.className," triggered!");
		return this.super.trigger('getCatalogues',this);
	}
	
}, Catalogue);


var NewYork_National = new Library({ name:"NewYork National", size:3000});
var Manhantan_National = new Library({ name:"Manhantan National", size:3000});


