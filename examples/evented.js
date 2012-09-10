var m = Stubs.create("M",{ 
	
	init: function(name,classic){ 
		this.name=name; 
		this.classic=classic;
	}, 
	
	updateAttr: function(a,c){ 
		if(!a && !c){ return; }
		this.name=a; 
		this.classic=c;
		return true;
	},
	
	toString: function(){
		return this.name+"\t"+this.classic;
	}
});

var n  = Stubs.create("N", { 
	
	init: function(s){ 
		this.status = s;
	},
	
});


var man = m().setup('gullet','oldie');
var man2 = m().setup('gullet4','oldie4'); //or new m().setup('sds','dds')
var man3 = m().setup('gullet9','oldie9');

var worm = n().setup('live');

worm.on("man",function(){
	console.log(man.toString());
},null,null);

worm.on("man",function(){
	console.log(man2.toString());
},null,null);

worm.on("man",function(){
	console.log(man3.toString());
},null,null);



