var Stubs = function(){};

//the current in use version of Stub
Stubs.version = "0.0.2";


//this class level method handles classic-type inheritance,ensure to use it before
//assigning any properties to the child prototype,incase of using the stub class without
//using its create method
Stubs.inherit = function(child,parent){
	
	function empty(){};
	empty.prototype = parent.prototype;
	
	child.prototype = new empty();
	
	child.prototype.constructor = child;
    child.parent = parent.prototype;
	
	parent.prototype.constructor = parent;

};

//nice if you want to share some specific features which to other objects like the onEach
//method or the map method or any method which a non-instanciated method has in its prototype
Stubs.share = function(obj,set){
	var client = obj.prototype;
	var server = this.prototype;
	
	for(var i = 0; i < set.length; i++){
		var c = set[i];
		if(!client[c] && server[c]){
			client[c] =  server[c];
		}
	}
	
};

//these little method does the destructive copy of all ability into the obj argument
Stubs.slugAbility = function(obj,ability){
	if(typeof ability == 'object' || typeof ability == 'function'){
		for(var e in ability){
		    obj[e] = ability[e];
	    }
    }
    return;
    
};

//the stub create function to create new classes with specific className,
//ability(just a bunch of functions and attributes you want it to have),
//and can specific a parent to inherit from 
//ability can contain a static and instance object within themselves
//that allow you to specify static properties that the Block object should have
//and the instance only properties
//basic js object to be created and returned with abilitys

Stubs.create = function(classname,ability,parent){
	var Block = function(){

		if(Block.parent){
			Block.parent.constructor.apply(this,arguments);
			this.super = Block.parent;
			this.super.init.apply(this,arguments);
		}
		
		if(this.init && typeof this.init == 'function'){
			this.init.apply(this,arguments);
		}
	};
	
	
	if(parent){ Stubs.inherit(Block,parent);}
	
	Stubs.slugAbility(Block.prototype,Stubs.prototype);
		
	if(ability){
		if(!ability.instance && !ability.static){ 
			Stubs.slugAbility(Block.prototype, ability);
		}
		if(ability.instance){ 
			Stubs.slugAbility(Block.prototype, ability.instance);
		}
		if(ability.static){ 
			Stubs.slugAbility(Block,ability.static);
		}
	}
	
	//shortcut to all Block objects prototype;
	Block.fn = Block.prototype;
	Block.fn.bindEvent = Block.fn.subscribe;
	Block.fn.unBindEvent = Block.fn.unSubscribe;
	Block.fn.triggerEvent = Block.fn.publish
	
	//sets the className for both instance and Object level scope
	Block.ObjectClassName = Block.fn.ObjectClassName = classname;
	
	Block.extend = Stubs.extend;
	return Block;
};

//allows a direct extension of the object from its parent directly
Stubs.extend = function(name,ability){
	var self = this;
	return Stubs.create(name,ability,self);
};

//its very ,very,reddiculously fast to copy attributes and functions between prototypes
//just specific properties that should exists in instance level
// like events objects for doing pubsub like event handling within an object,
//its couple with the objects but this system does still allow the use of mediators
//between different objects if need be to handle calling the specific events from
//between different objects,the mediator is nothing more than a simple function or
//objects that gets the events of each objects and passes the appropriate arguments
//to them

Stubs.prototype = {
	
	events : {
		namespace: {},
		eventspace:{}
	},
	
	map: function(obj,callback,scope){
	    var result = [];
		if(!scope){ scope = this; }
		
		this.onEach(obj,function(o,i,b){
			var r = callback.call(scope,o,i,b);
			if(r) result.push(r);
		},scope);
		return result;
	},

	each: function(callback){
	    var self = this;
	    for(var e in self){
			callback.call(self,e,self);
	    }
	},
	
	onEach: function(obj,callback,scope){
		var scoped=scope;
		if(!scope){ scoped = this; }
		
	    if('length' in obj || this.isObjectType(obj,"array") || this.isObjectType(obj,"string")){
			for(var i=0; i < obj.length; i++){
		    	callback.call(scoped,obj[i],i,obj);
			}
			return;
	    }

	    if(this.isObjectType(obj,'object') || typeof obj === "object"){
			for(var e in obj){
		    	callback.call(scoped,e,obj);
			}
			return;
	    }
	},
	
	getObjectType: function(obj){
		return ({}).toString.call(obj).match(/\s([\w]+)/)[1].toLowerCase();
	},
	
	objectType: function(){
	    var self = this;
	    return ({}).toString.call(self).match(/\s([\w]+)/)[1].toLowerCase();
	},

	isObjectType: function(obj,type){
	    return ({}).toString.call(obj).match(/\s([\w]+)/)[1].toLowerCase() === type.toLowerCase();
	},
	
	has: function(property,obj){
		var state = false;
		this.onEach(obj,function(o,i,b){
			if(o == property){
				state = true;
			}
		},this);
		
		return state;
	},
	
	proxy: function(fn){
		var self=this;
		return function(){
			return fn.apply(this,arguments);
		}();
	},
	
	trigger: function(method,scope){
		var self = this;
		if(self[method]){
			return self[method].apply(scope,arguments);
		};
	},
	
	setEventTypes: function(o){
		if(this.isObjectType(o,"array")){
			this.onEach(o, function(o,i,b){
				this.events.eventspace[o] = [];
			},this);
		}else if(typeof o == "string"){
			this.events.eventspace[o]=[];
		}
	},
	
	_addEvent: function(event,namespace,callback,scope){
		if(this.events.namespace[namespace]){
			throw new Error("Namespace already exists!");
		}else{
		
		if(!this.events.eventspace[event]){
			this.events.eventspace[event]=[];
		}
		
		this.events.namespace[namespace] = function(){
			return callback.apply(scope,arguments);
		};
		this.events.eventspace[event].push(namespace);
		}
	},
	
	_removeEvent: function(event,namespace){
		if(!this.events.namespace[namespace]){
			return;
		}
		
		var list = this.events;
		
		this.onEach(list.eventspace[event], function(o,i,b){
			if(o == namespace){
				b.splice(i,1);
				delete list.namespace[namespace];
			}
		},this);
	},
	
	flushEvents: function(){
		this.events.namespace = {};
		this.events.eventspace = {};
	},
	
	subscribe: function(obj,event,namespace,callback){
		if(obj && obj._addEvent){
			obj._addEvent(event,namespace,callback,this);
		}
	},
	
	unSubscribe: function(obj,event,namespace){
		if(obj && obj._removeEvent){
			obj._removeEvent(event,namespace);
		}
	},
	
	publish: function(event,args,namespace){
		if(!this.events.eventspace[event]) return;
		
		var list = this.events;
		
		if(!namespace){
			
			this.onEach(list.eventspace[event],function(o,i,b){
				this.events.namespace[o].apply(this,args || []);
			},this);
			
		}else if(typeof namespace == "string"){
			
			this.events.namespace[namespace].apply(this,args || []);
			
		}else if(this.isObjectType(namespace,'array')){
			this.onEach(list.eventspace[event],function(o,i,b){
				this.onEach(namespace, function(e,h,k){
					if(e == o){
						this.events.namespace[e].apply(this,args || []);
					}
				},this);
			},this);
		}
	
	},
	
};


//specific properties that can be useful from the Stubs top level object
//incase there lacks specific functions not available,prefer these method than
//over-ridden the function object prototype itself,far more safer 
Stubs.proxy = Stubs.prototype.proxy;
Stubs.onEach = Stubs.prototype.onEach;
Stubs.map =  Stubs.prototype.map;
Stubs.getObjectType = Stubs.prototype.getObjectType;
Stubs.isObjectType = Stubs.prototype.isObjectType;

