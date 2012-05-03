var m = Stubs.create("M",{ 
	init: function(s){ this.slap = s; },
	slaps: function(){ return this.slap;}
});

//create a new object from through stub create method
var n = Stubs.create("N",{ 
	init:function(s,n){ this.n=n;}, 
	wave: function(){ return this.n;}
},m);


//for the lovers of simplicity,inheritance direct from the object itself,
//extends just calls the object itself with the giving className and ability

var h = n.extend("Sucker",{ 
	slapping: function(){}
});

//for the lovers of simplicity,inheritance direct from the object itself,
//extends just calls the object itself with the giving className and ability
//extend the arguments of the object
var s = n.extend("Sucker",{ 
	init: function(s,n,b){ this.b=b; },
	slapping: function(){}
});

//using the nice class-level to instance level properties in your classes
var R = Stubs.create("R",{
	//class level methods r.Find
	static:{
		find: function(){ return "calling class-level find"; },
		select: function(){ return "calling class-level select";},
		create: function(){ return "calling class-level create";}
	},
	//instance level methods var b = new r; b.search()
	instance: {
		init: function(status){ this.status = status;},
		search: function(){ return "calling instance-level search"; },
		destroy: function(){return "calling instance-level destroy";},
		getStatus: function(){ return this.status;}
	}
});

var test = new m('sucker');

var test2 = new n('sucker','locker');

var test3 = new h("suckr",'locker');

var test4 = new s("suckr",'locker','decker');


//even Stubs is simple an object that allows you to create objects from itself
var emptyStub = new Stubs();

// playing with R
'find' in R; //will return true;
'select' in R; //will return true;
'create' in R; //will return true;
'search' in R; //will return false;

var j = new R('Flawed!');
j.status();
j.search();
j.destroy();