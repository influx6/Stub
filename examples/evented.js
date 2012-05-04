var m = Stubs.create("M",{ 
	
	init: function(name,classic){ 
		this.name=name; 
		this.classic=classic;
	}, 
	
	updateAttr: function(a,c){ 
		console.log(arguments);
		this.name=a; 
		this.classic=c;
	} 
});

var n  = Stubs.create("N", { 
	
	init: function(s){ 
		this.status = s;
	},
	
	
	
});

var man = new m('gullet','oldie');
var man2 = new m('gullet4','oldie4');
var man3 = new m('gullet9','oldie9');

var worm = new n('live');

console.log("first true:",man);
console.log("second true",man2);
console.log("third true",man3);

console.log(worm.events);


//allows you to subscribe to an object,the first argument in the subscribe method
//is the object being subscribed to,the event name,the namespace and the callback method
//to call when the event occurs
man.subscribe(worm,'change','man.change',man.updateAttr);
man2.subscribe(worm,'change','man2.change',man2.updateAttr);
man3.subscribe(worm,'change','man3.change',man3.updateAttr);

//manually setting of the 'change' event,normally you simple call publish in house or
//from a controller than initiates it after an action or from within a click event
//publish can take simple the event name or the event name,an array of arguments to apply
//a namespace to only publish or a array of namespace to publish

worm.publish('change');
worm.publish('change',['gullet2','oldi2']);

worm.publish('change',['gullet3','oldi3'],'man.change');
worm.publish('change',['gullet5','oldie6'],['man3.change','man2.change']);


