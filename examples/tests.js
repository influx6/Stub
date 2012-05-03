var m = Stubs.create("M",{ 
	init: function(s){ this.slap = s; },
	slaps: function(){ return this.slap;}
});

var n = Stubs.create("N",{ 
	init:function(s,n){ this.n=n;}, 
	wave: function(){ return this.n;}
},m);

var h = n.extend("Sucker",{ 
	slapping: function(){}
});

var s = n.extend("Sucker",{ 
	init: function(s,n,b){ this.b=b; },
	slapping: function(){}
});


var test = new m('sucker');

var test2 = new n('sucker','locker');

var test3 = new h("suckr",'locker');

var test4 = new s("suckr",'locker','decker');


