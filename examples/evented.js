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

//allows you to subscribe to an object,the first argument in the subscribe method
//is the object being subscribed to,the event name,the namespace and the callback method
//to call when the event occurs
man.subscribe(worm,'change','man.change',man.updateAttr);
man2.subscribe(worm,'change','man2.change',man2.updateAttr);
man3.subscribe(worm,'change','man3.change',man3.updateAttr);

//the publish function like every pubsub pattern propergates the notification that an event has occured to all subscribes with the giving arguments to pass to them respectfully
worm.publish('change');
worm.publish('change',['gullet2','oldi2']);

//triggerENS allows you to trigger the events of a particular namespace directory if you want more of a specific namespace or a series of namespace,just added for convenience,possibility of using it,probably none


worm.triggerENS('man.change',['gullet3','oldi3']);
worm.triggerENS(['man3.change','man2.change'],['gullet5','oldie6']);


