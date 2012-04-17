//a simple example class using Stub,a Simple library

var Catalogue = Stub.create("Catalogue",{
	
	initialize: function(){
		this.catalogue=[];
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
		console.log("calling parent/inherited catalogue");
		return this.catalogue;
	},
	
});

var Library = Stub.create("Library",{
	initialize: function(settings){
		this.settings = settings;
		this.bookLists=[];
	},
	
	addBook: function(book,catalogue){},
	
	removeBook: function(){},
		
	getBooks: function(){},
	
	getCatalogues: function(){
		this._super.getCatalogues.call(this);
	}
	
}, Catalogue);


var NewYork_National = new Library({ name:"NewYork National", size:3000});
var Manhantan_National = new Library({ name:"Manhantan National", size:3000});
